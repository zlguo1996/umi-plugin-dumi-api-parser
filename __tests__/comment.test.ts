import { readJsonSync } from "fs-extra"
import { checkUniqueIds, flatChildrenList, getIdMap } from "../src/utils"
import { generateDefinition } from "./typedocUtils"
import extractDoc from '../src/extractDoc';

describe('Typedoc - Comment', () => {
    const fileName = 'FunctionsComment'
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
        const type = extractDoc(item, map)
        expect(
            type.description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "function T01"
                }
            ]
        )
        expect(
            type.parameters[0].description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "parameter a"
                }
            ]
        )
        expect(
            type.returns?.description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "return value"
                }
            ]
        )
    })

    test('T02', () => {
        const item = map.get(nameMap.get('T02'))
        const type = extractDoc(item, map)
        expect(
            type.description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "function T02"
                }
            ]
        )
        expect(
            type.parameters[0].description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "parameter a"
                }
            ]
        )
        expect(
            type.parameters[1].description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "parameter b"
                }
            ]
        )
        expect(
            type.returns?.description
        ).toMatchObject(
            [
                {
                    "kind": "text",
                    "text": "return value"
                }
            ]
        )
    })
})