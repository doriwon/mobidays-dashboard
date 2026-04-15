export const safeNumber = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return isFinite(n) ? n : 0;
};

export const safeDivide = (a: number, b: number): number => {
    return b === 0 ? 0 : a / b;
};
