import { ContextItem } from "../../ContextItem";
import getPRsToPaintPerSHAs from "../github/getPRsToPaintPerSHAs";
import * as vscode from "vscode";
import getPlural from "../others/text/getPlural";
import { backendURL, WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
import dateToHumanReadable from "../others/text/dateToHumanReadable";

export const getHubLabBucketItems = async (
  issuesWithTitlesAndGroupedComments: any[] | { errorText: string },
  reposource: string
) => {
  let items: ContextItem[] = [];
  console.log(reposource, "reposource");
  let errorText = "";
  if (
    issuesWithTitlesAndGroupedComments &&
    "errorText" in issuesWithTitlesAndGroupedComments
  ) {
    errorText = issuesWithTitlesAndGroupedComments.errorText;
  }
  if (errorText) {
    items.push(
      new ContextItem(
        `Please login to ${
          reposource === "gitlab.com"
            ? "GitLab"
            : reposource === "bitbucket.com"
            ? "Bitbucket"
            : "GitHub"
        }`,
        vscode.TreeItemCollapsibleState.None,
        `to see ${reposource === "gitlab.com" ? "M" : "P"}Rs`,
        {
          command: WATERMELON_OPEN_LINK_COMMAND,
          title: "Login to GitHub",
          arguments: [{ url: backendURL, source: "treeView" }],
        },
        undefined,
        reposource === "gitlab.com"
          ? "gitLab"
          : reposource === "bitbucket.com"
          ? "bitbucket"
          : "gitHub"
      )
    );
    return items;
  }
  let sortedPRs: any[] = [];
  if (Array.isArray(issuesWithTitlesAndGroupedComments)) {
    sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
      (a: any, b: any) => b.comments.length - a.comments.length
    );
    console.log(sortedPRs, "sortedPRs");
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
          arguments: [{ url: pr.url || pr.repo_url, source: "treeView" }],
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
        reposource === "gitlab.com"
          ? "GitLab"
          : reposource === "bitbucket.com"
          ? "Bitbucket"
          : "GitHub",
        vscode.TreeItemCollapsibleState.Collapsed,
        `${sortedPRs.length.toString()} ${
          reposource === "gitlab.com" ? "M" : "P"
        }R${getPlural(sortedPRs.length)}`,
        undefined,
        gitHubItems,
        reposource === "gitlab.com"
          ? "gitLab"
          : reposource === "bitbucket.com"
          ? "bitbucket"
          : "gitHub"
      )
    );
  } else if (issuesWithTitlesAndGroupedComments.errorText === "") {
  } else {
    items.push(
      new ContextItem(
        reposource === "gitlab.com"
          ? "GitLab"
          : reposource === "bitbucket.com"
          ? "Bitbucket"
          : "GitHub",
        vscode.TreeItemCollapsibleState.None,
        `No ${reposource === "gitlab.com" ? "M" : "P"}Rs found`,
        undefined,
        undefined,
        reposource === "gitlab.com"
          ? "gitLab"
          : reposource === "bitbucket.com"
          ? "bitbucket"
          : "gitHub"
      )
    );
  }
  return items;
};
