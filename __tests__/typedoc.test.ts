import { execSync } from 'child_process';
import { readJsonSync, writeJson } from 'fs-extra';
import stringifyType from '../src/stringifyType';
import { checkUniqueIds, flatChildrenList, getIdMap } from '../src/utils';

async function generateDefinition(fileName: string) {
    execSync(`typedoc ./__tests__/typedoc/${fileName}.ts --json ./__tests__/typedoc/${fileName}.typedoc.json`)
}

async function generateExpect(fileName: string) {
    const definition = await import(`./typedoc/${fileName}.typedoc.json`)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);
    const res: any = {}
    for (const [key, item] of map) {
        if (!/T\d+/.test(item.name)) continue;
        res[item.name] = stringifyType(item, map)
    }
    await writeJson(`./__tests__/typedoc/${fileName}.expect.json`, res, { spaces: 4 })
}

const fileNames = ['UtilityTypes']
for (const fileName of fileNames) {
    generateDefinition('UtilityTypes')

    describe(`Typedoc - ${fileName}`, () => {
        const definition = readJsonSync(`./__tests__/typedoc/${fileName}.typedoc.json`)
        const expectation = readJsonSync(`./__tests__/typedoc/${fileName}.expect.json`)

        const list = flatChildrenList(definition.children);
        checkUniqueIds(list);
        const map = getIdMap(list);

        for (const [key, item] of map) {
            if (!/T\d+/.test(item.name)) continue;
            test(item.name, () => {
                expect(stringifyType(item, map)).toBe(expectation[item.name])
            })
        }
    })
}
