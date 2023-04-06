import { readJsonSync } from "fs-extra"
import { checkUniqueIds, flatChildrenList, getIdMap } from "../src/utils"
import { generateDefinition, getCallSignature } from "./typedocUtils"
import extractDoc from '../src/extractDoc';

describe('Typedoc - Default Value', () => {
    const fileName = 'FunctionsDefaultValue'
    generateDefinition(fileName)
    const definition = readJsonSync(`./__tests__/typedoc/${fileName}.typedoc.json`)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);
    const nameMap = new Map<string, any>()
    for (const item of list) {
        if (/T\d+/.test(item.name)) {
            nameMap.set(item.name, item.id)
        }
    }

    test('T01', () => {
        const item = map.get(nameMap.get('T01'))
        const type = extractDoc(item, map).type
        const parameters = getCallSignature(type).parameters
        expect(
            parameters[0].defaultValue
        ).toBe(
            '...'   // TODO
        )
    })

    test('T02', () => {
        const item = map.get(nameMap.get('T02'))
        const type = extractDoc(item, map).type
        const parameters = getCallSignature(type).parameters
        expect(
            parameters[0].defaultValue
        ).toBe(
            "'1'"
        )
    })

    test('T03', () => {
        const item = map.get(nameMap.get('T03'))
        const type = extractDoc(item, map).type
        const parameters = getCallSignature(type).parameters
        expect(
            parameters[0].defaultValue
        ).toBe(
            undefined
        )
        expect(
            parameters[1].defaultValue
        ).toBe(
            '...'
        )
    })

    test('T04', () => {
        const item = map.get(nameMap.get('T04'))
        const type = extractDoc(item, map).type
        const parameters = getCallSignature(type).parameters
        expect(
            parameters[0].defaultValue
        ).toBe(
            undefined
        )
        expect(
            parameters[1].defaultValue
        ).toBe(
            undefined
        )
    })

    test('T05', () => {
        const item = map.get(nameMap.get('T05'))
        const type = extractDoc(item, map).type
        const parameters = getCallSignature(type).parameters
        expect(
            parameters[0].defaultValue
        ).toBe(
            undefined
        )
        expect(
            parameters[1].defaultValue
        ).toBe(
            undefined
        )
    })
})