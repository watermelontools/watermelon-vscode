import * as vscode from "vscode";
import getFullBlame from "./getFullBlame";

async function getNumberOfLineChanges(gitAPI:any, lineNumber:number) {
    let blamePromises = await getFullBlame(
        lineNumber,
        lineNumber,
        vscode.window.activeTextEditor?.document.uri.fsPath,
        gitAPI
    );
    return Promise.allSettled(blamePromises).then((results) => {
        let blames: string[] = [];
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                blames.push(result.value);
            } else {
                blames.push(result.reason);
            }
        });

        return blames.length;
    });
}
export default getNumberOfLineChanges;