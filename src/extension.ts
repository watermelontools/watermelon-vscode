import * as vscode from "vscode";
import getGitHubUserInfo from "./utils/getGitHubUserInfo";
import getWebviewOptions from "./utils/vscode/getWebViewOptions";
import 
fsdvs
v zxc 
dcsxzcs
getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import analcxcccyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
import getDailySummary from "./utils/github/getDailySummary";
import {
  WATERMELON_ADD_TO_RECOMMENDED_COMMAND,
  WATERMELON_HISTORY_COMMAND,
  WATERMELON_LOGIN_COMMAND,
  WATERMELON_MULTI_SELECT_COMMAND,
  WATERMELON_OPEN_LINK_COMMAND,
  WATERMELON_PULLS_COMMAND,
  WATERMELON_SELECT_COMMAND,
  WATERMELON_SHOW_COMMAND,
} from "./constants";
import multiSelectCommandHandler from "./utils/commands/multiSelect";
import selectCommandHandler from "./utils/commands/select";
import debugLogger from "./utils/vscode/debugLogger";
import checkIfUserStarred from "./utils/github/checkIfUserStarred";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  const startupState: object | undefined =
    context.globalState.get("startupState");
  debugLogger(`startupState: ${JSON.stringify(startupState)}`);
  const workspaceState: object | undefined =
    context.workspaceState.get("workspaceState");
  debugLogger(`workspaceState: ${JSON.stringify(workspaceState)}`);
  // create telemetry reporter on extension activation
  let reporter = analyticsReporter();
  reporter?.sendTelemetryEvent("extensionActivated");
  let gitAPI = await getGitAPI();
  debugLogger(`got gitAPI`);

  const provider = new WatermelonSidebar(context, reporter);
  debugLogger(`created provider`);

  let wmStatusBarItem = statusBarItem();
  debugLogger(`created wmStatusBarItem`);

  context.subscriptions.push(
    // webview
    vscode.window.registerWebviewViewProvider(
      WatermelonSidebar.viewType,
      provider
    ),
    // action bar item
    wmStatusBarItem,
    // register some listener that make sure the status bar
    // item always up-to-date
    vscode.window.onDidChangeActiveTextEditor(async () => {
      updateStatusBarItem(wmStatusBarItem);
    })
  );
  if (reporter) {
    context.subscriptions.push(
      // ensure reporter gets properly disposed. Upon disposal the events will be flushed
      reporter
    );
  }
  // update status bar item once at start
  updateStatusBarItem(wmStatusBarItem);

  // create the hover provider
  let wmHover = hover({ reporter });

  let loginCommandHandler = async () => {
    const credentials = new Credentials();
    debugLogger(`got credentials`);
    await credentials.initialize(context);
    debugLogger("intialized credentials");
    octokit = await credentials.getOctokit();
    let githubUserInfo = await getGitHubUserInfo({ octokit });
    debugLogger(`githubUserInfo: ${JSON.stringify(githubUserInfo)}`);
    let username = githubUserInfo.login;
    context.globalState.update("startupState", { username });
    reporter?.sendTelemetryEvent("githubUserInfo", { username });
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      },
    });
    if (credentials) {
      setLoggedIn(true);
      reporter?.sendTelemetryEvent("login");
      updateStatusBarItem(wmStatusBarItem);
    }
  };
  let addToRecommendedCommandHandler = async () => {
    vscode.commands.executeCommand(
      "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
      "WatermelonTools.watermelon-tools"
    );
  };

  let historyCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);
    provider.sendMessage({
      command: "loading",
    });
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
    const credentials = new Credentials();
    debugLogger(`got credentials`);
    await credentials.initialize(context);
    debugLogger("intialized credentials");
    octokit = await credentials.getOctokit();
    let githubUserInfo = await getGitHubUserInfo({ octokit });
    debugLogger(`githubUserInfo: ${JSON.stringify(githubUserInfo)}`);
    let username = githubUserInfo.login;
    context.globalState.update("startupState", { username });
    reporter?.sendTelemetryEvent("githubUserInfo", { username });
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      },
    });

    let dailySummary = await getDailySummary({
      octokit,
      owner: owner || "",
      repo: repo || "",
      username: username || "",
    });
    debugLogger(`dailySummary: ${JSON.stringify(dailySummary)}`);
    provider.sendMessage({
      command: "dailySummary",
      data: dailySummary,
    });
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
      let sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
        (a: any, b: any) => b.comments.length - a.comments.length
      );
      provider.sendMessage({
        command: "prs",
        data: sortedPRs,
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
      let sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
        (a: any, b: any) => b.comments.length - a.comments.length
      );
      provider.sendMessage({
        command: "prs",
        data: sortedPRs,
      });
    }
  };
  let showCommandHandler = async () => {
    vscode.commands.executeCommand("watermelon.sidebar.focus");
    reporter?.sendTelemetryEvent("showCommand");
  };
  let linkCommandHandler = async ({
    url,
    source,
  }: {
    url: string;
    source?: string;
  }) => {
    vscode.commands.executeCommand("watermelon.sidebar.focus");
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
    reporter?.sendTelemetryEvent("linkCommand", {
      url,
      source: source || "unknown",
    });
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
    ),
    vscode.commands.registerCommand(
      WATERMELON_LOGIN_COMMAND,
      loginCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_ADD_TO_RECOMMENDED_COMMAND,
      addToRecommendedCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_OPEN_LINK_COMMAND,
      linkCommandHandler
    )
  );

  vscode.authentication.getSession("github", []).then(async (session: any) => {
    setLoggedIn(true);
    provider.sendMessage({
      command: "session",
      loggedIn: true,
      data: session.account.label,
    });
    debugLogger(`session: ${JSON.stringify(session)}`);
    const credentials = new Credentials();
    debugLogger(`got credentials`);
    await credentials.initialize(context);
    debugLogger("intialized credentials");
    octokit = await credentials.getOctokit();
    let githubUserInfo = await getGitHubUserInfo({ octokit });
    debugLogger(`githubUserInfo: ${JSON.stringify(githubUserInfo)}`);
    let username = githubUserInfo.login;
    context.globalState.update("startupState", { username });
    reporter?.sendTelemetryEvent("githubUserInfo", { username });
    let isStarred = await checkIfUserStarred({ octokit });

    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
        isStarred,
      },
    });
    let dailySummary = await getDailySummary({
      octokit,
      owner: owner || "",
      repo: repo || "",
      username: username || "",
    });
    debugLogger(`dailySummary: ${JSON.stringify(dailySummary)}`);
    provider.sendMessage({
      command: "dailySummary",
      data: dailySummary,
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
    debugLogger(`arrayOfSHAs: ${JSON.stringify(arrayOfSHAs)}`);
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
  let repoInfo = await getRepoInfo({ reporter });
  repo = repoInfo?.repo;
  owner = repoInfo?.owner;
  debugLogger(`repo: ${repo}`);
  debugLogger(`owner: ${owner}`);
  context.workspaceState.update("workspaceState", {
    ...workspaceState,
    repo,
    owner,
  });
  owner && repo && reporter?.sendTelemetryEvent("repoInfo", { owner, repo });

  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });
}
