import * as vscode from "vscode";
import getFullBlame from "./getFullBlame";

async function getBlame(
  gitAPI: any,
  startLine = undefined,
  endLine = undefined
) {
  let blamePromises = await getFullBlame(
    startLine || (vscode?.window?.activeTextEditor?.selection.start.line ?? 1),
    endLine ||
      (vscode?.window?.activeTextEditor?.selection.end.line ??
        vscode.window.activeTextEditor?.document.lineCount ??
        2),
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
    return uniqueBlames;
  });
}
export default getBlame;
