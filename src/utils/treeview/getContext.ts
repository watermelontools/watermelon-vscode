import { ContextItem } from "../../ContextItem";
import * as vscode from "vscode";
import axios from "axios";
import {
  ServiceDescriptions,
  ServiceKeys,
  WATERMELON_OPEN_LINK_COMMAND,
  backendURL,
} from "../../constants";
import analyticsReporter from "../vscode/reporter";

export const getContext = async ({
  email,
  repo,
  owner,
  uniqueBlames,
}: {
  email: string;
  repo: string;
  owner: string;
  uniqueBlames: any[];
}) => {
  let items: ContextItem[] = [];
  const commitList = uniqueBlames.map((commit) => commit.message).toString();
  if (!repo || !owner) {
    return null;
  }
  let reporter = analyticsReporter();
  console.log({
    email,
    repo,
    owner,
    commitList,
  });
  let codeContext = await axios
    .post(`${backendURL}/api/extension/getContext`, {
      email,
      repo,
      owner,
      commitList,
    })
    .then((res) => res.data)
    .catch((err) => {
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });
  const { data } = codeContext;
  for (let key in data) {
    let service = data[key];
    if (!Array.isArray(service)) {
      continue;
    }
    const internalItems = service.map(
      (element: any) =>
        new ContextItem(
          element.title,
          vscode.TreeItemCollapsibleState.Expanded,
          "",
          {
            command: WATERMELON_OPEN_LINK_COMMAND,
            title: `View in ${key}`,
            arguments: [
              {
                url: element.link,
                source: "treeView",
              },
            ],
          },
          [
            new ContextItem(
              element.body,
              vscode.TreeItemCollapsibleState.None,
              "",
              undefined,
              undefined
            ),
          ]
        )
    );
    items.push(
      new ContextItem(
        key,
        service.length
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.None,
        key === ServiceKeys.SUMMARY
          ? ServiceDescriptions[key as ServiceKeys]
          : `Found ${internalItems.length} ${
              ServiceDescriptions[key as ServiceKeys]
            }`,
        undefined,
        internalItems,
        key
      )
    );
  }
  items.push(
    new ContextItem(
      "Try our GitHub App",
      vscode.TreeItemCollapsibleState.None,
      "",
      {
        command: "vscode.open",
        title: "Get code contexts in your PR reviews",
        arguments: [
          vscode.Uri.parse("https://github.com/marketplace/watermelon-context"),
        ],
      }
    )
  );
  return items;
};
