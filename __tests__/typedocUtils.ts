import { execSync } from 'child_process';
import { writeJson } from 'fs-extra';
import stringifyType from '../src/stringifyType';
import { checkUniqueIds, flatChildrenList, getIdMap } from '../src/utils';

export function generateDefinition(fileName: string) {
    execSync(`typedoc ./__tests__/typedoc/${fileName}.ts --json ./__tests__/typedoc/${fileName}.typedoc.json`)
}

export function compressJson(jsonString: string) {
    return jsonString.replace(/[\s]/g, '')
}

export async function generateExpect(fileName: string) {
    const definition = await import(`./typedoc/${fileName}.typedoc.json`)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);
    const res: any = {}
    for (const [key, item] of map) {
        if (!/T\d+/.test(item.name)) continue;
        res[item.name] = stringifyType(item, map, new Set())
    }
    await writeJson(`./__tests__/typedoc/${fileName}.expect.json`, res, { spaces: 4 })
}