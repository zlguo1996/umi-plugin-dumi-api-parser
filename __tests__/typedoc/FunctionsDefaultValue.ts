interface A {
    a1: number
    a2: string
}

export function T01(a: A = { // TODO 无法解析： https://github.com/TypeStrong/typedoc/issues/1552 插件解决
    a1: 1,
    a2: '2'
}) {
    return a
}
export function T02(a = '1') {
    return a
}
export function T03(
    a: number,
    b: A = { // TODO 无法解析： https://github.com/TypeStrong/typedoc/issues/1552 插件解决
        a1: 1,
        a2: '2'
    }
) {
    return a + b.a1
}
/**
 * @param a
 * @param [b.a1 = 1]    // NOTE 无法解析
 * @param [b.a2 = '2']
 */
export function T04(a: number, b: A) {
    return a + b.a1
}

export type T05 = {
    description: string;
    (a: number, b: string): boolean;
}