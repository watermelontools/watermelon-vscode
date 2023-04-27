import * as vscode from "vscode";
import { backendURL, WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
import { ContextItem } from "../../ContextItem";
import dateToHumanReadable from "../others/text/dateToHumanReadable";
import getPlural from "../others/text/getPlural";
import searchMessagesByText from "../slack/searchMessagesByText";

export const getSlackItems = async (
  searchString: string,
  accountLabel: string
) => {
  let items: ContextItem[] = [];
  const relevantSlackThreads = await searchMessagesByText({
    email: accountLabel,
    text: searchString,
  });
  let errorText = "";
  if (relevantSlackThreads?.errorText) {
    if (relevantSlackThreads && "errorText" in relevantSlackThreads) {
      errorText = relevantSlackThreads?.errorText;
      items.push(
        new ContextItem(
          "Please login to Slack",
          vscode.TreeItemCollapsibleState.None,
          "to see Threads",
          {
            command: WATERMELON_OPEN_LINK_COMMAND,
            title: "Login to Slack",
            arguments: [{ url: backendURL, source: "treeView" }],
          },
          undefined,
          "slack"
        )
      );
      return items;
    }
  }
  const slackItems = relevantSlackThreads?.map((thread: any) => {
    const dateToTransform = new Date(parseFloat(thread.ts) * 1000);
    return new ContextItem(
      `#${thread.channel.name}`,
      vscode.TreeItemCollapsibleState.Collapsed,
      `${dateToHumanReadable(new Date(dateToTransform))}`,
      {
        command: WATERMELON_OPEN_LINK_COMMAND,
        title: "View Slack thread",

        arguments: [
          {
            url: thread.permalink,
            source: "treeView",
          },
        ],
      },
      thread.replies?.flatMap((reply: any, index: number) => {
        return [
          new ContextItem(
            reply.userInfo?.user?.profile?.real_name,
            vscode.TreeItemCollapsibleState.None,
            reply.userInfo?.user?.name,
            {
              command: WATERMELON_OPEN_LINK_COMMAND,
              title: "View comment",
              arguments: [
                {
                  url: `${thread.permalink.split("/archives")[0]}/team/${
                    reply.userInfo?.user?.id
                  }`,
                  source: "treeView",
                },
              ],
            },
            undefined,
            reply?.userInfo?.user?.profile?.image_512,
            index === thread.replies.length - 1
              ? "slackCommentable"
              : undefined,
            thread
          ),
          new ContextItem(
            reply.text,
            vscode.TreeItemCollapsibleState.None,
            dateToHumanReadable(new Date(parseFloat(reply.ts))),
            {
              command: WATERMELON_OPEN_LINK_COMMAND,
              title: "View Slack thread",

              arguments: [
                {
                  url: thread.permalink,
                  source: "treeView",
                },
              ],
            },
            undefined,
            undefined,
            index === thread.replies.length - 1
              ? "slackCommentable"
              : undefined,
            thread
          ),
        ];
      }),
      thread?.userInfo?.user?.profile?.image_512,
      "slackCommentable",
      thread
    );
  });
  if (!slackItems?.length) {
    items.push(
      new ContextItem(
        "Slack",
        vscode.TreeItemCollapsibleState.None,
        `No Threads found`,
        undefined,
        undefined,
        "slack"
      )
    );
  } else {
    items.push(
      new ContextItem(
        "Slack",
        vscode.TreeItemCollapsibleState.Collapsed,
        `${relevantSlackThreads?.length?.toString()} thread${getPlural(
          relevantSlackThreads?.length
        )}`,
        undefined,
        slackItems,
        "slack"
      )
    );
  }
  return items;
};
