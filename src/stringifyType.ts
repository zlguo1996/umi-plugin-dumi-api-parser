import flattenUtilityType from './flattenUtilityType';

function stringifyType(item: any, ref: Map<any, any>): string {
    const flattened = flattenUtilityType(item, ref)

    switch (flattened.type) {
        case 'intersection':
            return flattened.types.map((i: any) => stringifyType(i, ref)).join(' & ')
        case 'union':
            return flattened.types.map((i: any) => stringifyType(i, ref)).join(' | ')
        case 'literal':
            return `'${flattened.value}'`
        case 'intrinsic':
            return flattened.name
        case 'tuple':
            return `[${flattened.elements.map((i: any) => stringifyType(i, ref)).join(', ')}]`
        case 'array':
            return `${stringifyType(flattened.elementType, ref)}[]`
    }

    switch (flattened.kindString) {
        case 'Interface':
            return `{${flattened.children.map((i: any) => stringifyType(i, ref)).join('; ')}}`
        case 'Call signature':
            return `function ${flattened.name}(${flattened.parameters.map((i: any) => stringifyType(i, ref)).join(', ')}): ${stringifyType(flattened.type, ref)}`
        case 'Parameter':
            return `${flattened.name}: ${stringifyType(flattened.type, ref)}`
        case 'Property':
            return `${flattened.name}${flattened.flags.isOptional ? '?' : ''}: ${stringifyType(flattened.type, ref)}`
        case 'Type alias':
            return stringifyType(flattened.type, ref)
    }

    if (flattened.typeArguments) {   // e.g. Array<string>
        return `${flattened.name}<${flattened.typeArguments.map((i: any) => stringifyType(i, ref)).join(', ')}>`
    }
    if (flattened.queryType) {    // e.g. useSWR
        return `${stringifyType(flattened.queryType, ref)}` // TODO 引用详细内容
    }

    return flattened.name
}

export default stringifyType
