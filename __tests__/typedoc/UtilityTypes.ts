interface A {
    a1: number
    a2: string
}

interface B {
    b1: number
    b2?: string
    b3: A
}

type C = (c1: number, c2: string) => B;

export type T01 = A & B;

export type T02 = Pick<B, 'b1' | 'b2'>;
export type T03 = Omit<B, 'b1' | 'b2'>;

export type T04 = Parameters<C>;
export type T05 = ReturnType<C>;

export type T06 = T04[0];
export type T07 = [string, number, B];
export type T08 = number[];
export type T09 = B['b2'];
export type T10 = B['b3'];
export type T11 = T08[0];
