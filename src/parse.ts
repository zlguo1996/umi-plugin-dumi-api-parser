import { exec, execSync } from "child_process";
import { readJson, readJsonSync, remove, removeSync } from "fs-extra";
import path from "path";
import extractDoc from "./extractDoc";
import { checkUniqueIds, flatChildrenList, getIdMap } from "./utils";

export default async function parse({
    entryFile,
    resolveDir,
}: {
    entryFile: string;
    resolveDir: string;
}) {
    const jsonPath = './typedoc.tmp.json'
    await new Promise((resolve, reject) => {
        exec(
            `typedoc --entryPoints ${path.join(resolveDir, entryFile)} --json ${jsonPath}`,
            (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                }
                resolve(stdout)
            })
    })
    const definition = await readJson(jsonPath)
    await remove(jsonPath)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);

    return definition.children.map((item: any) => {
        return extractDoc(item, map)
    })
}