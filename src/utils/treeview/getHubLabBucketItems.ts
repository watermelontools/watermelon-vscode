import { ContextItem } from "../../ContextItem";
import getPRsToPaintPerSHAs from "../github/getPRsToPaintPerSHAs";
import * as vscode from "vscode";
import getPlural from "../others/text/getPlural";
import { backendURL, WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
import dateToHumanReadable from "../others/text/dateToHumanReadable";

export const getHubLabBucketItems = async (
  issuesWithTitlesAndGroupedComments: any[] | { errorText: string }
) => {
  let items: ContextItem[] = [];
  let errorText = "";
  if (
    issuesWithTitlesAndGroupedComments &&
    "errorText" in issuesWithTitlesAndGroupedComments
  ) {
    errorText = issuesWithTitlesAndGroupedComments.errorText;
  }

  if (errorText) {
    // show vs code alert
    vscode.window.showErrorMessage(errorText);
    items.push(
      new ContextItem(
        "Please login to GitHub",
        vscode.TreeItemCollapsibleState.None,
        "to see PRs",
        {
          command: WATERMELON_OPEN_LINK_COMMAND,
          title: "Login to GitHub",
          arguments: [{ url: backendURL, source: "treeView" }],
        },
        undefined,
        "github"
      )
    );
    return items;
  }
  let sortedPRs: any[] = [];
  if (Array.isArray(issuesWithTitlesAndGroupedComments)) {
    sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
      (a: any, b: any) => b.comments.length - a.comments.length
    );
    let gitHubItems = sortedPRs.map((pr: any) => {
      return new ContextItem(
        pr.title,
        pr.comments.length > 0
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
        `${pr.comments.length.toString()} comment${getPlural(
          pr.comments.length
        )}`,
        {
          command: WATERMELON_OPEN_LINK_COMMAND,
          title: "View PR",
          arguments: [{ url: pr.url, source: "treeView" }],
        },
        pr.comments.length > 0
          ? pr.comments.map((comment: any) => {
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
          : undefined
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
  } else if (issuesWithTitlesAndGroupedComments.errorText === "") {
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
