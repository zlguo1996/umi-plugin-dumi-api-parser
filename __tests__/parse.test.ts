import { cwd } from "process"
import parse from "../src/parse"

test('Parse', async () => {
    const data = await parse({
        entryFile: '__tests__/parse/simple.ts',
        resolveDir: cwd(),
    })
    expect(data.T01.parameters[0].typeString).toBe('{a1: number; a2: string}')
})