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

export function withStack(typeTransformer: (item: any, map: Map<any, any>, stack: Set<number>) => any, maxSize = 100) {
    return (item: any, map: Map<any, any>, stack: Set<number>) => {
        // if ((item.id && stack.has(item.id)) || stack.size === maxSize) {
        //     return item
        // }
        stack.add(item.id)
        const res = typeTransformer(item, map, stack);
        stack.delete(item.id)
        return res;
    }
}