interface A {
    a1: number
    a2: string
}

/**
 * function T01
 * @param a parameter a
 * @returns return value
 */
export function T01(a: A) {
    return a
}

export type T02 = {
    description: string;
    /**
     * function T02
     * @param a parameter a
     * @param b parameter b
     * @returns return value
     */
    (a: number, b: string): boolean;
}