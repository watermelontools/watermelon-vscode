import * as vscode from "vscode";
import getFullBlame from "./getFullBlame";

async function getNumberOfFileChanges(gitAPI:any, filePath:string){
    let blameArray: string[] = [];
    let blames = await gitAPI?.repositories[0].blame(
        filePath || "."
    );

    blames.split("\n").forEach((line: String) => {
        blameArray.push(line.split(" ")[0]);
    });

    let uniqueBlames = [
        ...new Set(blameArray),
    ];
   
    return uniqueBlames.length;
}
export default getNumberOfFileChanges;