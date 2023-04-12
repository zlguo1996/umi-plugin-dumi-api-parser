import flattenUtilityType from "./flattenUtilityType"

export default function stringifyType(itemRaw: any, ref: Map<any, any>, stack: Set<number>): string {
    if (itemRaw.id && stack.has(itemRaw.id)) {
        return itemRaw.qualifiedName || itemRaw.name
    }

    stack.add(itemRaw.id)

    const result = (() => {
        const item = flattenUtilityType(itemRaw, ref, new Set())
        switch (item.type) {
            case 'intersection':
                return item.types.map((i: any) => stringifyType(i, ref, stack)).join(' & ')
            case 'union':
                return item.types.map((i: any) => stringifyType(i, ref, stack)).join(' | ')
            case 'literal':
                return typeof item.value === 'number' ? `${item.value}` : `'${item.value}'`
            case 'intrinsic':
                return item.name
            case 'tuple':
                return `[${item.elements.map((i: any) => stringifyType(i, ref, stack)).join(', ')}]`
            case 'array':
                return `${stringifyType(item.elementType, ref, stack)}[]`
            // TODO Call Signatures https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures
        }

        switch (item.kindString) {
            case 'Interface':
                return `{${(item.children || []).map((i: any) => stringifyType(i, ref, stack)).join('; ')}}`
            case 'Call signature':
                return `function ${item.name}(${(item.parameters || []).map((i: any) => stringifyType(i, ref, stack)).join(', ')}): ${stringifyType(item.type, ref, stack)}`
            case 'Parameter':
                return `${item.name}: ${stringifyType(item.type, ref, stack)}`
            case 'Property':
                return `${item.name}${item.flags.isOptional ? '?' : ''}: ${stringifyType(item.type, ref, stack)}`
            case 'Type alias':
                return stringifyType(item.type, ref, stack)
        }

        if (item.typeArguments) {   // e.g. Array<string>
            return `${item.name}<${item.typeArguments.map((i: any) => stringifyType(i, ref, stack)).join(', ')}>`
        }
        if (item.queryType) {    // e.g. useSWR
            return `${stringifyType(item.queryType, ref, stack)}` // TODO 引用详细内容
        }

        return item.name
    })()

    stack.delete(itemRaw.id)

    return result
}
