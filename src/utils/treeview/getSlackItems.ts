import * as vscode from "vscode";
import { WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
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
  const slackItems = relevantSlackThreads?.map((thread) => {
    return new ContextItem(
      `#${thread.channel.name}`,
      vscode.TreeItemCollapsibleState.Collapsed,
      `${dateToHumanReadable(new Date(parseFloat(thread.ts)))}`,
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
      thread.replies?.flatMap((reply: any) => {
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
            reply?.userInfo?.user?.profile?.image_512
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
            undefined
          ),
        ];
      }),
      thread?.userInfo?.user?.profile?.image_512
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
        `${relevantSlackThreads?.length.toString()} thread${getPlural(
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
