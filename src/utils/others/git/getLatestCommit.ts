import * as vscode from "vscode";
import getBlame from "../../getBlame";
export default async function getLatestCommit({
    startLine,
    endLine,
    currentlyOpenTabfilePath,
    gitAPI
}: {
    startLine: number,
    endLine: number,
    currentlyOpenTabfilePath: vscode.TextDocument,
    gitAPI: any | undefined
}): Promise<any> {
    let blame = await getBlame(gitAPI);
    const uniqueBlames = [
        ...new Map(
          blame.map((item) =>
            // @ts-ignore
            [item["message"], item]
          )
        ).values(),
      ];
    return uniqueBlames[0];
}
