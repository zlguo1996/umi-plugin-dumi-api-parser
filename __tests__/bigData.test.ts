import { readJson, writeJson } from 'fs-extra';
import extractDoc from '../src/extractDoc';
import { checkUniqueIds, flatChildrenList, getIdMap } from '../src/utils';

const fileNames = [
    'pearl',
]
for (const fileName of fileNames) {
    test(`Typedoc - BigData - ${fileName}`, async () => {
        const definition = await readJson(`./__tests__/bigData/${fileName}.typedoc.json`)
        // const expectation = readJsonSync(`./__tests__/typedoc/${fileName}.expect.json`)

        const list = flatChildrenList(definition.children);
        checkUniqueIds(list);
        const map = getIdMap(list);

        const item = definition.children.find((item: any) => item.name === 'useFetch')
        await writeJson('./__tests__/bigData/pearl.json', extractDoc(item, map))

        expect(1).toBe(1)
    })
}
