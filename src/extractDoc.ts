import flattenUtilityType from "./flattenUtilityType";
import stringifyType from "./stringifyType";

function extracDocForType(item: any, ref: Map<any, any>) {
    const typeString = stringifyType(item, ref)
    const shallowFlattened = flattenUtilityType(item, ref)

    return {
        /** 格式化类型为字符串 */
        typeString: typeString,
        /** 默认值 */
        default: item.defaultValue,
        /** 注释 */
        description: item.comment?.shortText,
        /** 原始typdoc数据 */
        type: shallowFlattened,
    }
}

export default function extractDoc(item: any, ref: Map<any, any>) {
    if (item.kindString === 'Function') {
        const signature = item.signatures[0]
        return {
            /** 类型 */
            type: 'Function',
            /** 名称 */
            name: item.name,
            /** 参数类型 */
            parameters: signature.parameters.map((item: any) => extracDocForType(item, ref)),
            /** 返回类型 */
            returns: extracDocForType(signature.type, ref),
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

