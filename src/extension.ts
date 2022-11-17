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
import analyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
import getGitHubDailySummary from "./utils/github/getDailySummary";
import {
  backendURL,
  EXTENSION_ID,
  GITHUB_AUTH_PROVIDER_ID,
  SCOPES,
  WATERMELON_ADD_TO_RECOMMENDED_COMMAND,
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
import getMostRelevantJiraTicket from "./utils/jira/getMostRelevantJiraTicket";
import getAssignedJiraTickets from "./utils/jira/getAssignedJiraTickets";
import { WatermelonAuthenticationProvider } from "./auth";

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
    }),
    // allow wm auth
    vscode.authentication.registerAuthenticationProvider(
      WatermelonAuthenticationProvider.id,
      "Watermelon Auth",
      new WatermelonAuthenticationProvider(context)
    ),
    vscode.window.registerUriHandler({
      handleUri(uri) {
        // show a hello message
        vscode.window.showInformationMessage("URI" + uri);
        const urlSearchParams = new URLSearchParams(uri.query);
        const params = Object.fromEntries(urlSearchParams.entries());
        context.secrets.store("watermelonToken", params.token);
        context.secrets.store("watermelonEmail", params.email);
        vscode.authentication.getSession(
          WatermelonAuthenticationProvider.id,
          [],
          {
            createIfNone: true,
          }
        );
      },
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
    // Get our PAT session.
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      [],
      { createIfNone: true }
    );
    if (session) {
      // We have a session, so we're logged in.
      setLoggedIn(true);
      vscode.window.showInformationMessage(`Welcome ${session.account.label}`);
    }
  };
  let addToRecommendedCommandHandler = async () => {
    vscode.commands.executeCommand(
      "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
      EXTENSION_ID
    );
  };

  let prsCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);
    provider.sendMessage({
      command: "loading",
    });
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (session) {

      let githubUserInfo = await getGitHubUserInfo({
        email: session.account.label,
      });
      debugLogger(`githubUserInfo: ${JSON.stringify(githubUserInfo)}`);
      provider.sendMessage({
        command: "user",
        data: {
          login: githubUserInfo.login,
          avatar: githubUserInfo.avatar_url,
        },
      });

      const jiraTickets = await getAssignedJiraTickets({
        user: session.account.label,
      });
      debugLogger(`jiraTickets: ${(jiraTickets)}`, true);

      let gitHubIssues = await getGitHubDailySummary({
        owner: owner || "",
        repo: repo || "",
        username: githubUserInfo.login || "",
        email: session.account.label,
      });
      debugLogger(`gitHubIssues: ${JSON.stringify(gitHubIssues)}`);
      provider.sendMessage({
        command: "dailySummary",
        data: { gitHubIssues, jiraTickets },
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
          email: session.account.label,
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
        let uniqueBlames = await getBlame(gitAPI, startLine, endLine);

        const parsedCommitObject = new Object(uniqueBlames[0]) as {
          date: string;
          message: string;
          author: string;
          email: string;
          commit: string;
          body: string;
          sha: string;
        };
        const parsedMessage = parsedCommitObject.message;

        // Jira
        const mostRelevantJiraTickets =
          (await getMostRelevantJiraTicket({
            user: session.account.label,
            prTitle: sortedPRs[0].title || parsedMessage,
          })) || {};
        provider.sendMessage({
          command: "prs",
          data: { sortedPRs, uniqueBlames, mostRelevantJiraTickets },
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
          email: session.account.label,
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
        let uniqueBlames = await getBlame(gitAPI, startLine, endLine);

        provider.sendMessage({
          command: "prs",
          data: { sortedPRs, uniqueBlames },
        });
      }
      let isStarred = await checkIfUserStarred({
        email: session.account.label,
      });
      provider.sendMessage({
        command: "user",
        data: {
          login: githubUserInfo.login,
          avatar: githubUserInfo.avatar_url,
          isStarred,
        },
      });
    } else {
      let uniqueBlames = await getBlame(gitAPI, startLine, endLine);
      provider.sendMessage({
        command: "prs",
        data: { sortedPRs: { error: "not logged in" }, uniqueBlames },
      });
      provider.sendMessage({
        command: "dailySummary",
        data: { error: "not logged in" },
      });
    }
  };
  let showCommandHandler = async () => {
    // @ts-ignore
    context.globalState.update(
      "openSidebarCount",
      (context.globalState.get("openSidebarCount") as number) + 1
    );
    if (
      context.globalState.get<number>("openSidebarCount") &&
      // @ts-ignore
      context.globalState.get<Number>("openSidebarCount") % 3 === 0
    ) {
      provider.sendMessage({
        command: "talkToCTO",
      });
    }
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
    let githubUserInfo = await getGitHubUserInfo({
      email: session.account.label,
    });
    debugLogger(`githubUserInfo: ${JSON.stringify(githubUserInfo)}`);
    context.globalState.update("openSidebarCount", 0);
    let isStarred = await checkIfUserStarred({ email: session.account.label });
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
        isStarred,
      },
    });
    let gitHubIssues = await getGitHubDailySummary({
      owner: owner || "",
      repo: repo || "",
      username: githubUserInfo.login || "",
      email: session.account.label,
    });
    debugLogger(`gitHubIssues: ${JSON.stringify(gitHubIssues)}`);
    provider.sendMessage({
      command: "dailySummary",
      data: gitHubIssues,
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

// Not used yet
// Allows cleanup
export function deactivate() {}
