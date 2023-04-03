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

export type T1 = A & B;
export type T2 = Pick<B, 'b1' | 'b2'>;
export type T3 = Omit<B, 'b1' | 'b2'>;

export type T4 = Parameters<C>;
export type T5 = ReturnType<C>;
export type T6 = T4[0];
export type T7 = [string, number, B];
export type T8 = number[];
export type T9 = B['b2'];
export type T10 = B['b3'];
