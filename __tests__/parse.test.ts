import { pick } from "lodash"
import parse from "../src/parse"

test('Parse', async () => {
    const data = await parse({
        entryFile: '__tests__/parse/simple.ts',
        resolveDir: '/Users/guozile/Documents/Code/umi-plugin-dumi-api-parser'
    })
    expect(data.map((item: any) => pick(item, ['typeString']))).toMatchObject([
        {
            typeString: '{a: number; b: string}',
        }
    ])
})