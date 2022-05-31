import * as vscode from "vscode";
import * as Path from "path";
import * as fs from "fs";
import { Credentials } from "./credentials";
import getWebviewOptions from "./utils/vscode/getWebViewOptions";
import getGitAPI from "./utils/vscode/getGitAPI";
import getSHAArray from "./utils/getSHAArray";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getLocalUser from "./utils/vscode/getLocalUser";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import WatermelonSidebar from "./watermelonSidebar";
import getBlame from "./utils/getBlame";
import getPackageInfo from "./utils/getPackageInfo";
import TelemetryReporter from "@vscode/extension-telemetry";
import updateStatusBarItem from "./utils/vscode/updateStatusBarItem";
import getGitHubUserInfo from "./utils/getGitHubUserInfo";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// user information
let userEmail: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];
// Selected block of code

let octokit: any;

// all events will be prefixed with this event name
const extensionId = "WatermelonTools.watermelon-tools";

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;

// the application insights key (also known as instrumentation key)
const key = "4ed9e755-be2b-460b-9309-426fb5f58c6f";

// telemetry reporter
let reporter: any;

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

  vscode.languages.registerHoverProvider('*', {
    provideHover(document, position, token) {
      const content = new vscode.MarkdownString(`[Understand the code context](command:watermelon.show) with Watermelon 🍉`);
      content.supportHtml = true;
      content.isTrusted = true;
      return new vscode.Hover(content);
    }
  });
  let { repoName, ownerUsername } = await getRepoInfo();
  repo = repoName;
  owner = ownerUsername;
  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.show", async () => {
      vscode.commands.executeCommand("watermelon.sidebar.focus");
    }));
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.select", async () => {
      vscode.commands.executeCommand("editor.action.smartSelect.expand");
    }));
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.multiSelect", async (times = 4) => {
      for (let index = 0; index < times; index++) {
        vscode.commands.executeCommand("editor.action.smartSelect.expand");
      }
    }));
  octokit = await credentials.getOctokit();
  getGitHubUserInfo({ octokit }).then(async (githubUserInfo) => {
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      }
    });
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.start", async (startLine = undefined, endLine = undefined) => {
      provider.sendMessage({
        command: "loading",
      });
      localUser = await getLocalUser();

      octokit = await credentials.getOctokit();
      if(startLine == undefined && endLine == undefined) {
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
    } else{}
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.blame", async () => {
      provider.sendMessage({
        command: "loading",
      });
      localUser = await getLocalUser();
      octokit = await credentials.getOctokit();
      let uniqueBlames = await getBlame(gitAPI);
      provider.sendMessage({
        command: "blame",
        data: uniqueBlames,
        owner,
        repo,
      });
    })
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
