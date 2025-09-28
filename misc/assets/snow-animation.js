// This code distributed under MIT license
// Author: https://github.com/DevBubba/Bookmarklets
// Code was deminified and used in https://github.com/deevroman/better-osm-org
function runSnowAnimation() {
    function i() {
        this.D = function () {
            const t = h.atan(this.i / this.d);
            l.save();
            l.translate(this.b, this.a);
            l.rotate(-t);
            l.scale(this.e, this.e * h.max(1, h.pow(this.j, .7) / 15));
            l.drawImage(m, -v / 2, -v / 2);
            l.restore();
        }
    }

    const h = Math;
    const r = h.random;
    const o = Date.now;
    const e = (() => {
        l.clearRect(0, 0, _, f);
        l.fill();
        requestAnimationFrame(e);
        const i = .001 * y.et;
        y.r();
        const s = L.et * g;
        for (let n = 0; n < C.length; ++n) {
            const t = C[n];
            t.i = h.sin(s + t.g) * t.h;
            t.j = h.sqrt(t.i * t.i + t.f);
            t.a += t.d * i;
            t.b += t.i * i;
            t.a > w && (t.a = -u);
            t.b > b && (t.b = -u);
            t.b < -u && (t.b = b);
            t.D();
        }
    });

    function s() {
        for (let e = 0; e < p; ++e) {
            C[e].a = r() * (f + u);
            C[e].b = r() * _;
        }
    }

    function n() {
        c.width = _ = innerWidth;
        c.height = f = innerHeight;
        w = f + u;
        b = _ + u;
        s();
    }

    class d {
        constructor(t, e = true) {
            this._ts = o();
            this._p = !0;
            this._pa = o();
            this.d = t;
            e && this.s();
        }

        get et() {
            return this.ip ? this._pa - this._ts : o() - this._ts
        }

        get rt() {
            return h.max(0, this.d - this.et)
        }

        get ip() {
            return this._p
        }

        get ic() {
            return this.et >= this.d
        }

        s() {
            this._ts = o() - this.et;
            this._p = !1;
            return this;
        }

        r() {
            this._pa = this._ts = o();
            return this;
        }

        p() {
            this._p = !0;
            this._pa = o();
            return this;
        }

        st() {
            this._p = !0;
            return this;
        }
    }

    const c = document.createElement("canvas");
    const H = c.style;
    H.position = "fixed";
    H.left = "0";
    H.top = "0";
    H.width = "100vw";
    H.height = "100vh";
    H.zIndex = "100000";
    H.pointerEvents = "none";
    document.body.insertBefore(c, document.body.children[0]);
    const l = c.getContext("2d"), p = 300, g = 5e-4, u = 20;
    let _ = c.width = innerWidth, f = c.height = innerHeight, w = f + u, b = _ + u;
    const v = 15.2, m = document.createElement("canvas");
    const E = m.getContext("2d");
    const x = E.createRadialGradient(7.6, 7.6, 0, 7.6, 7.6, 7.6);
    x.addColorStop(0, "hsla(255,255%,255%,1)");
    x.addColorStop(1, "hsla(255,255%,255%,0)");
    E.fillStyle = x;
    E.fillRect(0, 0, v, v);
    let y = new d(0, !0), C = [], L = new d(0, !0);
    for (let j = 0; j < p; ++j) {
        const t = new i;
        t.a = r() * (f + u);
        t.b = r() * _;
        t.c = 1 * (3 * r() + .8);
        t.d = .1 * h.pow(t.c, 2.5) * 50 * (2 * r() + 1);
        t.d = t.d < 65 ? 65 : t.d;
        t.e = t.c / 7.6;
        t.f = t.d * t.d;
        t.g = r() * h.PI / 1.3;
        t.h = 15 * t.c;
        t.i = 0;
        t.j = 0;
        C.push(t);
    }
    s();
    document.addEventListener("visibilitychange", () => setTimeout(n, 100), !1);
    document.addEventListener("resize", n, !1);
    e();
}
