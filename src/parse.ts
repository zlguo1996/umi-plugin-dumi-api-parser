import { exec, execSync } from "child_process";
import { readJson, readJsonSync, remove, removeSync } from "fs-extra";
import path from "path";
import extractDoc from "./extractDoc";
import { checkUniqueIds, flatChildrenList, getIdMap } from "./utils";

export default async function parse({
    entryFile,
    resolveDir,
    preserveTmpFile,
}: {
    entryFile: string;
    resolveDir: string;
    preserveTmpFile?: boolean;
}) {
    const jsonPath = './typedoc.tmp.json'
    await new Promise((resolve, reject) => {
        exec(
            `typedoc --entryPoints ${path.join(resolveDir, entryFile)} --json ${path.join(resolveDir, jsonPath)}`,
            (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                }
                resolve(stdout)
            })
    })
    const definition = await readJson(jsonPath)
    if (!preserveTmpFile) {
        await remove(jsonPath)
    }

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);

    const docList = definition.children.filter(
        (item: any) => ![
            'Module', 'Namespace' // 过滤不会展示在文档中的内容
        ].includes(item.kindString)
    ).map((item: any) => {
        return extractDoc(item, map)
    })

    const docNameMap: { [key: string]: any } = {}
    docList.forEach((item: any) => {
        docNameMap[item.name] = item
    })
    return docNameMap
}