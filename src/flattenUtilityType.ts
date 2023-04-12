import { flatten, merge } from "lodash"

function resolveReference(item: any, ref: Map<any, any>): any {
    if (item.type === 'reference' && item.package !== 'typescript' && ref.get(item.id)) {
        return resolveReference(ref.get(item.id), ref)
    }
    if (item.type === 'reflection' && item.declaration) {
        return resolveReference(item.declaration, ref)
    }
    if (item.kindString === 'Type literal' && item.signatures?.length === 1) {
        return resolveReference(item.signatures[0], ref)
    }
    if (item.kindString === 'Type alias') {
        return resolveReference(item.type, ref)
    }
    return item
}

/**
 * 将嵌套的引用结构 & Utility Types（e.g. Pick） 展开成简单的更加易于阅读的结构
 * https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys
 * @param item 
 * @param ref 
 * @returns 
 */
function flattenUtilityType(item: any, ref: Map<any, any>): any {
    const itemReal = resolveReference(item, ref)

    // 基础类型子类型简化
    if (itemReal.kindString === 'Parameter' || itemReal.kindString === 'Property') {
        return merge(itemReal, { type: flattenUtilityType(itemReal.type, ref) })
    }
    if (itemReal.type === 'indexedAccess') {
        const isNumberIndex = itemReal.indexType.type === 'literal' && typeof itemReal.indexType.value === 'number'
        const isStringIndex = itemReal.indexType.type === 'literal' && typeof itemReal.indexType.value === 'string'
        const object = flattenUtilityType(itemReal.objectType, ref)

        if (isNumberIndex && object.type === 'array') {
            return flattenUtilityType(object.elementType, ref)
        }
        if (isNumberIndex && object.type === 'tuple') {
            return flattenUtilityType(object.elements[itemReal.indexType.value], ref)
        }
        if (isStringIndex && object.kindString === 'Interface') {
            const property = object.children.find((property: any) => property.name === itemReal.indexType.value)
            if (property) {
                const propertyType = flattenUtilityType(property.type, ref)
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
        const types = itemReal.types.map((type: any) => resolveReference(type, ref))
        const typesAreInterfaces = types.every((type: any) => type.kindString === 'Interface')
        if (typesAreInterfaces) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: flatten(types.map((type: any) => type.children))
            }
        }
    }

    if (itemReal.type === 'reference' && itemReal.package === 'typescript' && itemReal.typeArguments.length) {
        const typeArguments = itemReal.typeArguments.map((type: any) => resolveReference(type, ref))

        // Interface 类型简化
        const firstTypeArgumentIsInterface = typeArguments[0].kindString === 'Interface'
        const secondTypeArgumentIsUnion = typeArguments[1]?.type === 'union'
        if (itemReal.name === 'Pick' && firstTypeArgumentIsInterface && secondTypeArgumentIsUnion) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.filter((child: any) => typeArguments[1].types.map((c: any) => c.value).includes(child.name)).map(
                    (child: any) => {
                        return flattenUtilityType(child, ref)
                    }
                )
            }
        }
        if (itemReal.name === 'Omit' && firstTypeArgumentIsInterface && secondTypeArgumentIsUnion) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.filter((child: any) => !typeArguments[1].types.map((c: any) => c.value).includes(child.name)).map(
                    (child: any) => {
                        return flattenUtilityType(child, ref)
                    }
                )
            }
        }
        if (itemReal.name === 'Partial' && firstTypeArgumentIsInterface) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.map((child: any) => {
                    return flattenUtilityType(merge(child, { flags: { isOptional: true } }), ref)
                })
            }
        }
        if (itemReal.name === 'Required' && firstTypeArgumentIsInterface) {
            return {
                "kind": 256,
                "kindString": "Interface",
                children: typeArguments[0].children.map((child: any) => {
                    return flattenUtilityType(merge(child, { flags: { isOptional: false } }), ref)
                })
            }
        }

        // Function 类型简化
        const firstTypeArgumentIsCallSignature = typeArguments[0].kindString === 'Call signature'
        if (itemReal.name === 'Parameters' && firstTypeArgumentIsCallSignature) {
            return {
                type: 'tuple',
                elements: typeArguments[0].parameters.map((parameter: any) => flattenUtilityType(parameter.type, ref))
            }
        }
        if (itemReal.name === 'ReturnType' && firstTypeArgumentIsCallSignature) {
            return flattenUtilityType(typeArguments[0].type, ref)
        }
    }

    return itemReal
}

export default flattenUtilityType