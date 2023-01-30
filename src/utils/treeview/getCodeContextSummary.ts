import { ContextItem } from "../../ContextItem";
import * as vscode from "vscode";
import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export const getCodeContextSummary = async (
  prTitle: string,
  prBody: string,
  blockOfCode: string,
  userEmail: string
) => {
  let items: ContextItem[] = [];

  let codeContextSummary = await axios
    .post(`${backendURL}/api/openai/summarizeCodeContext`, {
      pr_title: prTitle,
      pr_body: prBody,
      block_of_code: blockOfCode,
      user_email: userEmail,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  items.push(
    new ContextItem(
      "Summary",
      vscode.TreeItemCollapsibleState.Expanded,
      "AI generated code context summary",
      undefined,
      [
        new ContextItem(
          codeContextSummary,
          vscode.TreeItemCollapsibleState.None,
          "",
          undefined
        ),
      ],
      "openai"
    )
  );
  return items;
};
