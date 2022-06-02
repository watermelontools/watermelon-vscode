import * as vscode from "vscode";
import TelemetryReporter from "@vscode/extension-telemetry";
import { Credentials } from "./credentials";
import getBlame from "./utils/getBlame";
import getSHAArray from "./utils/getSHAArray";
import getGitAPI from "./utils/vscode/getGitAPI";
import getPackageInfo from "./utils/getPackageInfo";
import WatermelonSidebar from "./watermelonSidebar";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getGitHubUserInfo from "./utils/getGitHubUserInfo";
import getWebviewOptions from "./utils/vscode/getWebViewOptions";
import updateStatusBarItem from "./utils/vscode/updateStatusBarItem";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

// all events will be prefixed with this event name
const extensionId = "WatermelonTools.watermelon-tools";

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;

// the application insights key (also known as instrumentation key)
const key = "4ed9e755-be2b-460b-9309-426fb5f58c6f";

// telemetry reporter
let reporter: TelemetryReporter;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  // create telemetry reporter on extension activation
  reporter = new TelemetryReporter(extensionId, extensionVersion, key);
  // ensure it gets properly disposed. Upon disposal the events will be flushed
  context.subscriptions.push(reporter);
  reporter.sendTelemetryEvent("extensionActivated");
  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);

  const provider = new WatermelonSidebar(context, reporter);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WatermelonSidebar.viewType,
      provider
    )
  );
  let wmStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  wmStatusBarItem.command = "watermelon.start";
  context.subscriptions.push(wmStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async () => {
      updateStatusBarItem(wmStatusBarItem);
    })
  );

  // update status bar item once at start
  updateStatusBarItem(wmStatusBarItem);

  vscode.languages.registerHoverProvider("*", {
    provideHover(document, position, token) {
      const args = [{ startLine: position.line, endLine: position.line }];
      const startCommandUri = vscode.Uri.parse(
        `command:watermelon.start?${encodeURIComponent(JSON.stringify(args))}`
      );
      const blameCommandUri = vscode.Uri.parse(
        `command:watermelon.blame?${encodeURIComponent(JSON.stringify(args))}`
      );
      const content = new vscode.MarkdownString(
        `[Understand the code context](${startCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[View the history for this line](${blameCommandUri}) with Watermelon 🍉`
      );
      content.supportHtml = true;
      content.isTrusted = true;
      return new vscode.Hover(content);
    },
  });
  let { repoName, ownerUsername } = await getRepoInfo();
  repo = repoName;
  owner = ownerUsername;
  reporter.sendTelemetryEvent("repoInfo", { owner, repo });

  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.show", async () => {
      vscode.commands.executeCommand("watermelon.sidebar.focus");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.select", async () => {
      vscode.commands.executeCommand("editor.action.smartSelect.expand");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "watermelon.multiSelect",
      async (times = 4) => {
        for (let index = 0; index < times; index++) {
          vscode.commands.executeCommand("editor.action.smartSelect.expand");
        }
      }
    )
  );
  octokit = await credentials.getOctokit();
  getGitHubUserInfo({ octokit }).then(async (githubUserInfo) => {
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      },
    });
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "watermelon.start",
      async (startLine = undefined, endLine = undefined) => {
        vscode.commands.executeCommand("watermelon.show");
        provider.sendMessage({
          command: "loading",
        });

        octokit = await credentials.getOctokit();
        if (startLine === undefined && endLine === undefined) {
          if (!arrayOfSHAs.length) {
            arrayOfSHAs = await getSHAArray(
              1,
              vscode.window.activeTextEditor?.document.lineCount ?? 2,
              vscode.window.activeTextEditor?.document.uri.fsPath,
              gitAPI
            );
          }
          console.log(arrayOfSHAs);

          let issuesWithTitlesAndGroupedComments = await getPRsToPaintPerSHAs({
            arrayOfSHAs,
            octokit,
            owner,
            repo,
          });
          if (!Array.isArray(issuesWithTitlesAndGroupedComments)) {
            return provider.sendMessage({
              command: "error",
              error: issuesWithTitlesAndGroupedComments,
            });
          }

          provider.sendMessage({
            command: "prs",
            data: issuesWithTitlesAndGroupedComments,
          });
        } else {
          vscode.commands.executeCommand("watermelon.multiSelect");
          arrayOfSHAs = await getSHAArray(
            startLine > 1 ? startLine - 1 : startLine,
            endLine + 1,
            vscode.window.activeTextEditor?.document.uri.fsPath,
            gitAPI
          );
          if (!arrayOfSHAs.length) {
            arrayOfSHAs = await getSHAArray(
              1,
              vscode.window.activeTextEditor?.document.lineCount ?? 2,
              vscode.window.activeTextEditor?.document.uri.fsPath,
              gitAPI
            );
          }

          let issuesWithTitlesAndGroupedComments = await getPRsToPaintPerSHAs({
            arrayOfSHAs,
            octokit,
            owner,
            repo,
          });
          if (!Array.isArray(issuesWithTitlesAndGroupedComments)) {
            return provider.sendMessage({
              command: "error",
              error: issuesWithTitlesAndGroupedComments,
            });
          }
          provider.sendMessage({
            command: "prs",
            data: issuesWithTitlesAndGroupedComments,
          });
        }
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "watermelon.blame",
      async (startLine = undefined, endLine = undefined) => {
        vscode.commands.executeCommand("watermelon.show");
        provider.sendMessage({
          command: "loading",
        });
        octokit = await credentials.getOctokit();
        let uniqueBlames = [];
        uniqueBlames = await getBlame(gitAPI, startLine, endLine);
        provider.sendMessage({
          command: "blame",
          data: uniqueBlames,
          owner,
          repo,
        });
      }
    )
  );

  vscode.authentication.getSession("github", []).then((session: any) => {
    setLoggedIn(true);
    provider.sendMessage({
      command: "session",
      loggedIn: true,
      data: session.account.label,
    });
  });
  octokit = await credentials.getOctokit();

  vscode.window.onDidChangeTextEditorSelection(async (selection) => {
    updateStatusBarItem(wmStatusBarItem);
    arrayOfSHAs = await getSHAArray(
      selection.selections[0].start.line,
      selection.selections[0].end.line,
      vscode.window.activeTextEditor?.document.uri.fsPath,
      gitAPI
    );
  });

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(WatermelonSidebar.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
      },
    });
  }
}
