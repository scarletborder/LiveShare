declare module "jsqr" {
    // 根据文档写最简单的类型
    export default function jsQR(
        data: Uint8ClampedArray,
        width: number,
        height: number,
        options?: any,
    ): { data: Uint8ClampedArray } | null;
}
