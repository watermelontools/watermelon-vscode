import { ContextItem } from "../../ContextItem";
import getPlural from "../others/text/getPlural";
import * as vscode from "vscode";
import getMostRelevantJiraTickets from "../jira/getMostRelevantJiraTickets";
import { WATERMELON_OPEN_LINK_COMMAND } from "../../constants";
import dateToHumanReadable from "../others/text/dateToHumanReadable";

export const getJiraItems = async (
  searchString: string,
  accountLabel: string
) => {
  let items: ContextItem[] = [];
  const mostRelevantJiraTickets =
    (await getMostRelevantJiraTickets({
      user: accountLabel,
      prTitle: searchString,
    })) || {};
  const jiraItems = mostRelevantJiraTickets?.map((ticket) => {
    return new ContextItem(
      ticket.key,
      vscode.TreeItemCollapsibleState.Collapsed,
      ticket.fields.summary,
      {
        command: WATERMELON_OPEN_LINK_COMMAND,
        title: "View Jira ticket",
        arguments: [`${"#"}/browse/${ticket.key}`],
      },
      [
        new ContextItem(
          ticket.renderedFields.description,
          vscode.TreeItemCollapsibleState.Collapsed,
          ticket.renderedFields.created,
          undefined,
          ticket.comments?.map((comment: any) => {
            return new ContextItem(
              comment.body,
              vscode.TreeItemCollapsibleState.None,
              dateToHumanReadable(comment.created),
              {
                command: WATERMELON_OPEN_LINK_COMMAND,
                title: "View comment",
                arguments: [comment.url],
              }
            );
          })
        ),
      ]
    );
  });
  if (!jiraItems || jiraItems.length === 0) {
    items.push(
      new ContextItem(
        "Jira",
        vscode.TreeItemCollapsibleState.Collapsed,
        `No Tickets found`,
        undefined,
        undefined,
        "jira"
      )
    );
  } else {
    items.push(
      new ContextItem(
        "Jira",
        vscode.TreeItemCollapsibleState.Collapsed,
        `${mostRelevantJiraTickets.length.toString()} ticket${getPlural(
          mostRelevantJiraTickets.length
        )}`,
        undefined,
        jiraItems ? jiraItems : [],
        "jira"
      )
    );
  }
  return items;
};
