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
      thread.text,
      vscode.TreeItemCollapsibleState.Collapsed,
      thread.channel.name,
      {
        command: WATERMELON_OPEN_LINK_COMMAND,
        title: "View Slack thread",

        arguments: [thread.url],
      },
      thread.replies?.map((message: any) => {
        return new ContextItem(
          message.text,
          vscode.TreeItemCollapsibleState.None,
          dateToHumanReadable(message.ts),
          {
            command: WATERMELON_OPEN_LINK_COMMAND,
            title: "View comment",
            arguments: [message.url],
          }
        );
      })
    );
  });
  if (!slackItems.length) {
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
        `${relevantSlackThreads.length.toString()} thread${getPlural(
          relevantSlackThreads.length
        )}`,
        undefined,
        slackItems,
        "slack"
      )
    );
  }
  return items;
};
