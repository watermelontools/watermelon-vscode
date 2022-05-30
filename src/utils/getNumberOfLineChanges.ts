import * as vscode from "vscode";
import getFullBlame from "./getFullBlame";

async function getNumberOfLineChanges(gitAPI:any, lineNumber:number) {
    let blamePromises = await getFullBlame(
        lineNumber,
        lineNumber,
        vscode.window.activeTextEditor?.document.uri.fsPath,
        gitAPI
    );

    let blameArray: string[] = [];
    let blames = await gitAPI?.repositories[0].blame(
        vscode.window.activeTextEditor?.document.uri.fsPath || "."
    );

    blames.split("\n").forEach((line: String) => {
        blameArray.push(line.split(" ")[0]);
    });

    let uniqueBlames = [
        ...new Set(blameArray),
    ];
   
    return uniqueBlames.length;
}
export default getNumberOfLineChanges;