declare function exportFunction<T extends Function>(
    func: T,
    targetScope: object,
    options?: {
        defineAs?: string;
        allowCallbacks?: boolean;
        allowCrossOriginArguments?: boolean;
    }
): T;

declare function cloneInto<T>(
    obj: T,
    targetScope: object,
    options?: {
        cloneFunctions?: boolean;
        wrapReflectors?: boolean;
    }
): T;
