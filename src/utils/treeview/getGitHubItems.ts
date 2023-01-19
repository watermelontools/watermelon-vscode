import { ContextItem } from "../../ContextItem";
import getPRsToPaintPerSHAs from "../github/getPRsToPaintPerSHAs";
import * as vscode from "vscode";
import getPlural from "../others/text/getPlural";
import { WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
import dateToHumanReadable from "../others/text/dateToHumanReadable";

export const getGitHubItems = async (
  arrayOfSHAs: string[],
  owner: string | undefined,
  repo: string | undefined,
  session: any
) => {
  let items: ContextItem[] = [];

  let issuesWithTitlesAndGroupedComments = await getPRsToPaintPerSHAs({
    arrayOfSHAs,
    email: session?.account.label || "",
    owner,
    repo,
  });
  let sortedPRs: any[] = [];
  if (Array.isArray(issuesWithTitlesAndGroupedComments)) {
    sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
      (a: any, b: any) => b.comments.length - a.comments.length
    );
    let gitHubItems = sortedPRs.map((pr: any) => {
      return new ContextItem(
        pr.title,
        vscode.TreeItemCollapsibleState.Collapsed,
        `${pr.comments.length.toString()} comment${getPlural(
          pr.comments.length
        )}`,
        {
          command: WATERMELON_OPEN_LINK_COMMAND,
          title: "View PR",
          arguments: [pr.url],
        },
        pr.comments.map((comment: any) => {
          return new ContextItem(
            comment.user.login,
            vscode.TreeItemCollapsibleState.None,
            comment.created_at,
            {
              command: WATERMELON_OPEN_LINK_COMMAND,
              title: "View comment",
              arguments: [comment.userLink],
            },
            [
              new ContextItem(
                comment.body,
                vscode.TreeItemCollapsibleState.None,
                dateToHumanReadable(comment.created_at),
                {
                  command: WATERMELON_OPEN_LINK_COMMAND,
                  title: "View comment",
                  arguments: [comment.url],
                }
              ),
            ]
          );
        })
      );
    });
    items.push(
      new ContextItem(
        "GitHub",
        vscode.TreeItemCollapsibleState.Collapsed,
        `${sortedPRs.length.toString()} PR${getPlural(sortedPRs.length)}`,
        undefined,
        gitHubItems,
        "github"
      )
    );
  } else {
    items.push(
      new ContextItem(
        "GitHub",
        vscode.TreeItemCollapsibleState.None,
        `No PRs found`,
        undefined,
        undefined,
        "github"
      )
    );
  }
  return items;
};
