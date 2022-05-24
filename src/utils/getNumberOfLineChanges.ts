import * as vscode from "vscode";
import getFullBlame from "./getFullBlame";

async function getNumberOfLineChanges(gitAPI:any) {
    let blamePromises = await getFullBlame(
        vscode?.window?.activeTextEditor?.selection.start.line ?? 1,
        vscode?.window?.activeTextEditor?.selection.end.line ??
        vscode.window.activeTextEditor?.document.lineCount ??
        2,
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

        const uniqueBlames = [
            ...new Map(
                blames.map((item) =>
                    // @ts-ignore
                    [item["message"], item]
                )
            ).values(),
        ];
        return uniqueBlames.length;
    });
}
export default getNumberOfLineChanges;