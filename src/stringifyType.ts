import flattenUtilityType from "./flattenUtilityType"

export default function stringifyType(itemRaw: any, ref: Map<any, any>): string {
    const item = flattenUtilityType(itemRaw, ref)
    switch (item.type) {
        case 'intersection':
            return item.types.map((i: any) => stringifyType(i, ref)).join(' & ')
        case 'union':
            return item.types.map((i: any) => stringifyType(i, ref)).join(' | ')
        case 'literal':
            return `'${item.value}'`
        case 'intrinsic':
            return item.name
        case 'tuple':
            return `[${item.elements.map((i: any) => stringifyType(i, ref)).join(', ')}]`
        case 'array':
            return `${stringifyType(item.elementType, ref)}[]`
        // TODO Call Signatures https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures
    }

    switch (item.kindString) {
        case 'Interface':
            return `{${item.children.map((i: any) => stringifyType(i, ref)).join('; ')}}`
        case 'Call signature':
            return `function ${item.name}(${(item.parameters || []).map((i: any) => stringifyType(i, ref)).join(', ')}): ${stringifyType(item.type, ref)}`
        case 'Parameter':
            return `${item.name}: ${stringifyType(item.type, ref)}`
        case 'Property':
            return `${item.name}${item.flags.isOptional ? '?' : ''}: ${stringifyType(item.type, ref)}`
        case 'Type alias':
            return stringifyType(item.type, ref)
    }

    if (item.typeArguments) {   // e.g. Array<string>
        return `${item.name}<${item.typeArguments.map((i: any) => stringifyType(i, ref)).join(', ')}>`
    }
    if (item.queryType) {    // e.g. useSWR
        return `${stringifyType(item.queryType, ref)}` // TODO 引用详细内容
    }

    return item.name
}
