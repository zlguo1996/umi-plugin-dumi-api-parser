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
export default resolveReference