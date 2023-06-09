import { readJsonSync } from 'fs-extra';
import stringifyType from '../src/stringifyType';
import { checkUniqueIds, flatChildrenList, getIdMap } from '../src/utils';
import { compressJson, generateDefinition, generateExpect } from './typedocUtils';

const fileNames = [
    'BasicTypes',
    'UtilityTypes',
    'Functions',
]
for (const fileName of fileNames) {
    generateDefinition(fileName)
    // generateExpect(fileName) // NOTE 测试用

    describe(`Typedoc - Stringify Type - ${fileName}`, () => {
        const definition = readJsonSync(`./__tests__/typedoc/${fileName}.typedoc.json`)
        const expectation = readJsonSync(`./__tests__/typedoc/${fileName}.expect.json`)

        const list = flatChildrenList(definition.children);
        checkUniqueIds(list);
        const map = getIdMap(list);

        for (const [key, item] of map) {
            if (!/T\d+/.test(item.name)) continue;
            test(item.name, () => {
                expect(
                    compressJson(stringifyType(item, map, new Set()))
                ).toBe(
                    compressJson(expectation[item.name])
                )
            })
        }
    })
}
