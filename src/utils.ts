import { uniqueId as generateUniqueId } from "lodash";

export function flatChildrenList(children: any[]): any[] {
    return children.reduce((acc, child) => {
        return acc.concat(child, flatChildrenList(child.children || []));
    }, []);
}

export function checkUniqueIds(list: any[]) {
    const ids = list.map(l => l.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        throw new Error('Non unique ids');
    }
}

export function getIdMap(list: any[]) {
    const map = new Map();
    list.forEach(l => map.set(l.id, l));
    return map;
}

export type Stack = Set<number>
type IWithStackOptions = {
    uniqueId?: boolean,
    maxSize?: number,
}
export function withStack(typeTransformer: (item: any, map: Map<any, any>, stack: Stack) => any, options: IWithStackOptions = {}) {
    const {
        uniqueId = false,
        maxSize = 1000,
    } = options
    return (item: any, map: Map<any, any>, stack: Set<number>) => {
        if ((uniqueId && item.id && stack.has(item.id)) || stack.size === maxSize) {
            console.log('>>> item.id', item.id, item.name, [...stack.keys()])
            return item
        }
        const id = item.id ? item.id : generateUniqueId('stack-')
        stack.add(id)
        const res = typeTransformer(item, map, stack);
        stack.delete(id)
        return res;
    }
}