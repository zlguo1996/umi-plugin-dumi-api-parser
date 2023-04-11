import { execSync } from "child_process";
import { readJsonSync, removeSync } from "fs-extra";
import path from "path";
import extractDoc from "./extractDoc";
import { checkUniqueIds, flatChildrenList, getIdMap } from "./utils";

export default function parse({
    entryFile,
    resolveDir,
}: {
    entryFile: string;
    resolveDir: string;
}) {
    const jsonPath = './typedoc.tmp.json'
    execSync(`typedoc --entryPoints ${path.join(resolveDir, entryFile)} --json ${jsonPath}`)
    const definition = readJsonSync(jsonPath)
    removeSync(jsonPath)

    const list = flatChildrenList(definition.children);
    checkUniqueIds(list);
    const map = getIdMap(list);

    return definition.children.map((item: any) => {
        return extractDoc(item, map)
    })
}