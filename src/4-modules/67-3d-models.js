//<editor-fold desc="3d-models" defaultstate="collapsed">

let prepared3dmrModel = null
const threeJsModuleUrl = "https://esm.sh/three@0.169.0"
const gltfLoaderModuleUrl = "https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"

function actionPrepare3dmrModel() {
    getWindow().view3DModelsMode = true
    const input = prompt("Enter 3DMR model ID:")
    if (input === null) {
        return
    }

    const modelId = Number(input.trim())
    if (!Number.isSafeInteger(modelId) || modelId <= 0) {
        alert("3DMR model ID must be a positive integer")
        return
    }

    void prepare3dmrModel(modelId)
}

async function prepare3dmrModel(modelId) {
    try {
        if (!getWindow().mapGL || !findVectorMap()) {
            throw new Error("Enable a vector map before loading a 3DMR model")
        }
        initThreeJs()
        const model = await download3dmrModel(modelId)

        const three = getWindow().__betterOsmThree
        if (!three?.WebGLRenderer || !getWindow().__betterOsmGLTFLoader) {
            throw new Error("Three.js did not expose the renderer and GLTFLoader globals")
        }
        console.info("Three.js loaded for 3DMR rendering", { revision: three.REVISION })

        display3dmrModel(model)
    } catch (error) {
        console.error("Could not prepare 3DMR model rendering", error)
        alert(`Could not load 3DMR model: ${error.message}`)
    }
}

function initThreeJs() {
    if (getWindow().__betterOsmThree?.WebGLRenderer) {
        return
    }
    GM_addElement(document.head, "script", {
        "data-better-osm-three": "true",
        type: "module",
        textContent: `import * as THREE from "${threeJsModuleUrl}";
import { GLTFLoader } from "${gltfLoaderModuleUrl}";
globalThis.__betterOsmThree = THREE;
globalThis.__betterOsmGLTFLoader = GLTFLoader;`,
    })
}

async function download3dmrModel(modelId) {
    const modelUrl = `https://3dmr.eu/api/model/${modelId}`
    const [modelResponse, infoResponse] = await Promise.all([
        externalFetch({
            method: "GET",
            url: modelUrl,
            responseType: "arraybuffer",
        }),
        externalFetch({
            method: "GET",
            url: `https://3dmr.eu/api/info/${modelId}`,
            responseType: "json",
        }),
    ])
    if (modelResponse.status !== 200) {
        throw new Error(`3DMR model API returned HTTP ${modelResponse.status}`)
    }
    if (infoResponse.status !== 200) {
        throw new Error(`3DMR metadata API returned HTTP ${infoResponse.status}`)
    }

    const glb = modelResponse.response
    if (!(glb instanceof ArrayBuffer) || glb.byteLength < 12 || new DataView(glb).getUint32(0, true) !== 0x46546c67) {
        throw new Error("3DMR returned data that is not a GLB model")
    }
    const modelInfo = infoResponse.response
    if (typeof modelInfo?.lon !== "number" || typeof modelInfo.lat !== "number") {
        throw new Error("3DMR returned metadata without coordinates")
    }

    prepared3dmrModel = { modelId, modelUrl, glb, modelInfo }
    console.info("3DMR GLB downloaded for map rendering", {
        modelId,
        modelUrl,
        byteLength: glb.byteLength,
        coordinates: [modelInfo.lon, modelInfo.lat],
    })
    return prepared3dmrModel
}

function display3dmrModel(model) {
    ensure3dmrRenderer()
    getMap().setView({ lat: model.modelInfo.lat, lng: model.modelInfo.lon })
    getWindow().__betterOsmRender3dmrModel(
        intoPage({
            glb: model.glb,
            longitude: model.modelInfo.lon,
            latitude: model.modelInfo.lat,
            rotation: Number.isFinite(model.modelInfo.rotation) ? model.modelInfo.rotation : 0,
        }),
    )
    findVectorMap().setPitch(50)
}

function ensure3dmrRenderer() {
    if (getWindow().__betterOsmRender3dmrModel) {
        return
    }

    injectJSIntoPage(`
        (() => {
            const layerId = "better-osm-3dmr-model"
            const earthCircumference = 40075016.68557849

            function findMap() {
                for (const mapLayer of globalThis.mapGL ?? []) {
                    const map = mapLayer?.getMaplibreMap?.()
                    if (map) return map
                }
                return null
            }

            function getMercatorTransform(longitude, latitude) {
                const latitudeRadians = latitude * Math.PI / 180
                return {
                    translateX: (longitude + 180) / 360,
                    translateY: (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2))) / 360,
                    translateZ: 0,
                    scale: 1 / (earthCircumference * Math.cos(latitudeRadians)),
                }
            }

            globalThis.__betterOsmRender3dmrModel = ({ glb, longitude, latitude, rotation = 0 }) => {
                const map = findMap()
                const THREE = globalThis.__betterOsmThree
                const GLTFLoader = globalThis.__betterOsmGLTFLoader
                if (!map || !THREE || !GLTFLoader) {
                    throw new Error("MapLibre, Three.js, or GLTFLoader is unavailable")
                }
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId)
                }

                const transform = getMercatorTransform(longitude, latitude)
                const modelLayer = {
                    id: layerId,
                    type: "custom",
                    renderingMode: "3d",
                    onAdd(mapInstance, gl) {
                        this.map = mapInstance
                        this.camera = new THREE.Camera()
                        this.scene = new THREE.Scene()

                        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
                        keyLight.position.set(0, -70, 100).normalize()
                        this.scene.add(keyLight)

                        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8)
                        fillLight.position.set(0, 70, 100).normalize()
                        this.scene.add(fillLight)
                        this.scene.add(new THREE.AmbientLight(0xffffff, 0.35))

                        new GLTFLoader().parse(
                            glb,
                            "",
                            gltf => {
                                gltf.scene.rotateY(THREE.MathUtils.degToRad(rotation))
                                this.scene.add(gltf.scene)
                                this.map.triggerRepaint()
                            },
                            error => console.error("Could not parse 3DMR GLB", error),
                        )

                        this.renderer = new THREE.WebGLRenderer({
                            canvas: mapInstance.getCanvas(),
                            context: gl,
                            antialias: true,
                        })
                        this.renderer.autoClear = false
                    },
                    render(gl, args) {
                        const mainMatrix = args.defaultProjectionData?.mainMatrix ?? args
                        const projection = new THREE.Matrix4().fromArray(mainMatrix)
                        const localTransform = new THREE.Matrix4()
                            .makeTranslation(transform.translateX, transform.translateY, transform.translateZ)
                            .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale))
                            .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))

                        this.camera.projectionMatrix = projection.multiply(localTransform)
                        this.renderer.resetState()
                        this.renderer.render(this.scene, this.camera)
                    },
                    onRemove() {
                        this.renderer?.dispose()
                    },
                }
                map.addLayer(modelLayer)
            }
        })()
    `)
}

//</editor-fold>
