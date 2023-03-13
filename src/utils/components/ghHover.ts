import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { WatermelonAuthenticationProvider } from "../../auth";
import { WATERMELON_PULLS_COMMAND } from "../../constants";
import getPRsPerSHAS from "../github/getPRsPerSHAS";
import getLatestCommit from "../others/git/getLatestCommit";
import getGitAPI from "../vscode/getGitAPI";
import getRepoInfo from "../vscode/getRepoInfo";
import path = require("path");

const ghHover = ({ reporter }: { reporter: TelemetryReporter | null }) => {
  return vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      let gitAPI = await getGitAPI();
      let latestCommit = await getLatestCommit({
        startLine: position.line,
        endLine: position.line,
        currentlyOpenTabfilePath: document,
        gitAPI,
      });
      let repoInfo = await getRepoInfo({ reporter });
      const repo = repoInfo?.repo;
      const owner = repoInfo?.owner;
      const repoSource = repoInfo?.source;
      const session = await vscode.authentication.getSession(
        WatermelonAuthenticationProvider.id,
        []
      );
      let prs = await getPRsPerSHAS({
        repo,
        owner,
        email: session?.account.label || "",
        shaArray: `${latestCommit.hash}, ${latestCommit.parents[0]}`,
        repoSource,
      });
      if (!prs) {
        return null;
      }
      let sortedPRs: any[] = [];
      if (Array.isArray(prs)) {
        sortedPRs = prs?.sort(
          (a: any, b: any) => b?.comments?.length - a?.comments?.length
        );
      }
      const lastPR = sortedPRs[0];
      const args = [{ startLine: position.line, endLine: position.line }];
      const startCommandUri = vscode.Uri.parse(
        `command:${WATERMELON_PULLS_COMMAND}?${encodeURIComponent(
          JSON.stringify(args)
        )}`
      );

      const content: vscode.MarkdownString = new vscode.MarkdownString(
        `<a href="${startCommandUri}">
          <span style="display:flex;align-items:center;">
          <img style="height:1em;max-height:1em;width:1em;max-width:1em;"
          src='${vscode.Uri.parse(
            path.join(
              __filename,
              "..",
              "..",
              "..",
              "..",
              "images",
              "logos",
              `githubSmall.svg`
            )
          )}' 
          />
           #${lastPR.number}: ${lastPR.title}
          </span>
        </a>`
      );

      content.appendMarkdown(`\n`);

      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      reporter?.sendTelemetryEvent("ghhover");
      return new vscode.Hover(content);
    },
  });
};
export default ghHover;
