import * as vscode from "vscode";
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
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import getNumberOfFileChanges from "./utils/getNumberOfFileChanges";
import analyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
import getDailySummary from "./utils/github/getDailySummary";
import {
  WATERMELON_HISTORY_COMMAND,
  WATERMELON_MULTI_SELECT_COMMAND,
  WATERMELON_PULLS_COMMAND,
  WATERMELON_SELECT_COMMAND,
  WATERMELON_SHOW_COMMAND,
} from "./constants";
import multiSelectCommandHandler from "./utils/commands/multiSelect";
import selectCommandHandler from "./utils/commands/select";
import showCommandHandler from "./utils/commands/show";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
let username: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  // create telemetry reporter on extension activation
  let reporter = analyticsReporter();
  reporter.sendTelemetryEvent("extensionActivated");
  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);
  const provider = new WatermelonSidebar(context, reporter);

  let wmStatusBarItem = statusBarItem();

  context.subscriptions.push(
    // webview
    vscode.window.registerWebviewViewProvider(
      WatermelonSidebar.viewType,
      provider
    ),
    // ensure reporter gets properly disposed. Upon disposal the events will be flushed
    reporter,
    // action bar item
    wmStatusBarItem,
    // register some listener that make sure the status bar
    // item always up-to-date
    vscode.window.onDidChangeActiveTextEditor(async () => {
      updateStatusBarItem(wmStatusBarItem);
    })
  );

  // update status bar item once at start
  updateStatusBarItem(wmStatusBarItem);

  // create the hover provider
  let wmHover = hover({ reporter });

  let repoInfo = await getRepoInfo();
  repo = repoInfo?.repo;
  owner = repoInfo?.owner;
  owner && repo && reporter.sendTelemetryEvent("repoInfo", { owner, repo });
  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });

  octokit = await credentials.getOctokit();
  let githubUserInfo = await getGitHubUserInfo({ octokit });
  let username = githubUserInfo.login;
  reporter.sendTelemetryEvent("githubUserInfo", { username });
  provider.sendMessage({
    command: "user",
    data: {
      login: githubUserInfo.login,
      avatar: githubUserInfo.avatar_url,
    },
  });
  if (owner && repo) {
    let dailySummary = await getDailySummary({
      octokit,
      owner,
      repo,
      username: username || "",
    });
    provider.sendMessage({
      command: "dailySummary",
      data: dailySummary,
    });
  }
  let historyCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);
    provider.sendMessage({
      command: "loading",
    });
    octokit = await credentials.getOctokit();
    let uniqueBlames = await getBlame(gitAPI, startLine, endLine);
    provider.sendMessage({
      command: "blame",
      data: uniqueBlames,
      owner,
      repo,
    });
  };
  let prsCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);
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
        (startLine && startLine > 1 ? startLine - 1 : startLine) ?? 1,
        endLine
          ? endLine + 1
          : vscode.window.activeTextEditor?.document.lineCount ?? 2,
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
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      WATERMELON_SHOW_COMMAND,
      showCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_SELECT_COMMAND,
      selectCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_MULTI_SELECT_COMMAND,
      multiSelectCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_PULLS_COMMAND,
      prsCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_HISTORY_COMMAND,
      historyCommandHandler
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
