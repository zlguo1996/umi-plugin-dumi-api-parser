import { flatten, merge } from "lodash"
import { Stack, withStack } from "./utils"

function resolveReferenceInner(item: any, ref: Map<any, any>, stack: Stack): any {
    if (item.type === 'reference' && item.package !== 'typescript' && ref.get(item.id)) {
        return resolveReference(ref.get(item.id), ref, stack)
    }
    if (item.type === 'reflection' && item.declaration) {
        return resolveReference(item.declaration, ref, stack)
    }
    if (item.kindString === 'Type literal' && item.signatures?.length === 1) {
        return resolveReference(item.signatures[0], ref, stack)
    }
    if (item.kindString === 'Type alias') {
        return resolveReference(item.type, ref, stack)
    }
    return item
}

const resolveReference = withStack(resolveReferenceInner, { uniqueId: false })

/**
 * 将嵌套的引用结构 & Utility Types（e.g. Pick） 展开成简单的更加易于阅读的结构
 * https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys
 * @param item 
 * @param ref 
 * @returns 
 */
function flattenUtilityTypeInner(item: any, ref: Map<any, any>, stack: Stack): any {
    const itemReal = resolveReference(item, ref, new Set())

    // 基础类型子类型简化
    if (itemReal.kindString === 'Parameter' || itemReal.kindString === 'Property') {
        return {
            ...itemReal,
            type: flattenUtilityType(itemReal.type, ref, stack)
        }
    }
    if (itemReal.type === 'indexedAccess') {
        const isNumberIndex = itemReal.indexType.type === 'literal' && typeof itemReal.indexType.value === 'number'
        const isStringIndex = itemReal.indexType.type === 'literal' && typeof itemReal.indexType.value === 'string'
        const object = flattenUtilityType(itemReal.objectType, ref, stack)

        if (isNumberIndex && object.type === 'array') {
            return flattenUtilityType(object.elementType, ref, stack)
        }
        if (isNumberIndex && object.type === 'tuple') {
            return flattenUtilityType(object.elements[itemReal.indexType.value], ref, stack)
        }
        if (isStringIndex && object.kindString === 'Interface') {
            const property = object.children.find((property: any) => property.name === itemReal.indexType.value)
            if (property) {
                const propertyType = flattenUtilityType(property.type, ref, stack)
                if (property.flags.isOptional) {
                    return {
                        "type": "union",
                        "types": [
                            propertyType,
                            {
                                "type": "intrinsic",
                                "name": "undefined"
                            }
                        ]
                    }
                }
                return propertyType
            }
        }
    }

    // Interface 类型简化
    if (itemReal.type === 'intersection') {
        const types = itemReal.types.map((type: any) => flattenUtilityType(type, ref, stack))
        const typesAreInterfaces = types.every((type: any) => type.kindString === 'Interface')
        if (typesAreInterfaces) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: flatten(types.map((type: any) => type.children))
            }
        }
        return {
            ...itemReal,
            types,
        }
    }

    if (itemReal.type === 'reference' && itemReal.package === 'typescript' && itemReal.typeArguments?.length) {
        const typeArguments = itemReal.typeArguments.map((type: any) => flattenUtilityType(type, ref, stack))

        // Interface 类型简化
        const firstTypeArgumentIsInterface = typeArguments[0].kindString === 'Interface'
        const secondTypeArgumentIsUnion = typeArguments[1]?.type === 'union'
        const secondTypeArgumentIsLiteral = typeArguments[1]?.type === 'literal'
        let secondTypeLiteralList: (string | number)[] = []
        if (secondTypeArgumentIsUnion) {
            secondTypeLiteralList = typeArguments[1].types.map((c: any) => c.value)
        } else if (secondTypeArgumentIsLiteral) {
            secondTypeLiteralList = [typeArguments[1].value]
        }

        if (itemReal.name === 'Pick' && firstTypeArgumentIsInterface && (secondTypeArgumentIsUnion || secondTypeArgumentIsLiteral)) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.filter(
                    (child: any) => secondTypeLiteralList.includes(child.name)).map(
                        (child: any) => {
                            return flattenUtilityType(child, ref, stack)
                        }
                    )
            }
        }
        if (itemReal.name === 'Omit' && firstTypeArgumentIsInterface && (secondTypeArgumentIsUnion || secondTypeArgumentIsLiteral)) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.filter(
                    (child: any) => !secondTypeLiteralList.includes(child.name)).map(
                        (child: any) => {
                            return flattenUtilityType(child, ref, stack)
                        }
                    )
            }
        }
        if (itemReal.name === 'Partial' && firstTypeArgumentIsInterface) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.map((child: any) => {
                    return flattenUtilityType(merge(child, { flags: { isOptional: true } }), ref, stack)
                })
            }
        }
        if (itemReal.name === 'Required' && firstTypeArgumentIsInterface) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.map((child: any) => {
                    return flattenUtilityType(merge(child, { flags: { isOptional: false } }), ref, stack)
                })
            }
        }

        // Function 类型简化
        const firstTypeArgumentIsCallSignature = typeArguments[0].kindString === 'Call signature'
        if (itemReal.name === 'Parameters' && firstTypeArgumentIsCallSignature) {
            return {
                type: 'tuple',
                elements: typeArguments[0].parameters.map((parameter: any) => flattenUtilityType(parameter.type, ref, stack))
            }
        }
        if (itemReal.name === 'ReturnType' && firstTypeArgumentIsCallSignature) {
            return flattenUtilityType(typeArguments[0].type, ref, stack)
        }

        if (['Pick', 'Omit', 'Partial', 'Required', 'Parameters', 'ReturnType'].includes(itemReal.name)) {
            return {
                ...itemReal,
                typeArguments,
            }
        }

        return itemReal
    }

    return itemReal
}

const flattenUtilityType = withStack(flattenUtilityTypeInner, { uniqueId: true })

export default flattenUtilityType