import { readJson, writeJson } from 'fs-extra';
import extractDoc from '../src/extractDoc';
import { checkUniqueIds, flatChildrenList, getIdMap } from '../src/utils';

test(`Typedoc - BigData - pearl`, async () => {
    const definition = await readJson(`./__tests__/bigData/pearl.typedoc.json`)
    const expectation = await readJson(`./__tests__/bigData/pearl.expect.json`)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);

    const item = definition.children.find((item: any) => item.name === 'useFetch')
    const result = extractDoc(item, map)
    // await writeJson('./__tests__/bigData/pearl.json', )

    expect(result.parameters.map(
        (item: any) => item.typeString
    )).toMatchObject(
        expectation.parameters.map(
            (item: any) => item.typeString
        )
    )
})
