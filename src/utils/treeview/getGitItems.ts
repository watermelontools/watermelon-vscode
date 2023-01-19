import { ContextItem } from "../../ContextItem";
import * as vscode from "vscode";
import dateToHumanReadable from "../others/text/dateToHumanReadable";
import getPlural from "../others/text/getPlural";

export const getGitItems = async (uniqueBlames: string[]) => {
  let items: ContextItem[] = [];
  let commitItems = uniqueBlames.map((commit: any) => {
    return new ContextItem(
      commit.message,
      vscode.TreeItemCollapsibleState.Collapsed,
      dateToHumanReadable(new Date(commit.commitDate)),
      undefined,
      [
        new ContextItem(
          commit.authorName,
          vscode.TreeItemCollapsibleState.None,
          commit.hash.slice(0, 7),
          undefined
        ),
      ]
    );
  });
  items.push(
    new ContextItem(
      "Git",
      vscode.TreeItemCollapsibleState.Collapsed,
      `${uniqueBlames.length.toString()} commit${getPlural(
        uniqueBlames.length
      )}`,
      undefined,
      commitItems,
      "git"
    )
  );
  return items;
};
