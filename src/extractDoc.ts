import flattenUtilityType from "./flattenUtilityType";
import stringifyType from "./stringifyType";

export default function extractDoc(item: any, ref: Map<any, any>) {
    const typeString = stringifyType(item, ref)
    const shallowFlattened = flattenUtilityType(item, ref)

    return {
        typeString: typeString,
        default: item.defaultValue,
        description: item.comment?.shortText,
        type: shallowFlattened,
    }
}

