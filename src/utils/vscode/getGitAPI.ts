import { API as BuiltInGitApi, GitExtension } from "../../@types/git";
import * as vscode from "vscode";

export default async function getGitAPI(): Promise<BuiltInGitApi | undefined> {
    try {
      const extension = vscode?.extensions?.getExtension(
        "vscode.git"
      ) as vscode.Extension<GitExtension>;
      if (extension !== undefined) {
        const gitExtension = extension.isActive
          ? extension.exports
          : await extension.activate();
  
        return gitExtension.getAPI(1);
      }
    } catch {}
  
    return undefined;
  }