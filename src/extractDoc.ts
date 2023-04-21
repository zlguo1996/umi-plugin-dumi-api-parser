import flattenUtilityType from "./flattenUtilityType";
import stringifyType from "./stringifyType";

function extracDocForType(item: any, ref: Map<any, any>) {
    const typeString = stringifyType(item, ref, new Set())
    const shallowFlattened = flattenUtilityType(item, ref, new Set())

    return {
        /** 格式化类型为字符串 */
        typeString: typeString,
        /** 默认值 */
        default: item.defaultValue,
        /** 注释 */
        description: item.comment?.summary,
        /** 原始typdoc数据 */
        type: shallowFlattened,
    }
}

export default function extractDoc(itemRaw: any, ref: Map<any, any>) {
    const item = flattenUtilityType(itemRaw, ref, new Set())
    if (item.kindString === 'Function' || item.kindString === 'Call signature') {
        const signature = item.kindString === 'Call signature' ? item : item.signatures[0]
        return {
            /** 类型 */
            type: 'Function',
            /** 名称 */
            name: item.name,
            /** 注释 */
            description: signature.comment?.summary,
            /** 参数类型 */
            parameters: (signature.parameters || []).map((item: any) => ({
                ...extracDocForType(item.type, ref),
                name: item.name,
                default: item.defaultValue,
                description: item.comment?.summary,
            })),
            /** 返回类型 */
            returns: {
                ...extracDocForType(signature.type, ref),
                description: signature.comment?.blockTags?.find?.((i: any) => i.tag === '@returns')?.content,
            },
        }
    }

    return {
        /** 类型 */
        type: item.kindString,
        /** 名称 */
        name: item.name,
        raw: extracDocForType(item, ref),
    }
}

