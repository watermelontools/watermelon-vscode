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
import getAllIssues from "./utils/github/getAllIssues";
import analyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
import getAssignedIssues from "./utils/github/getAssignedIssues";
import getCreatorIssues from "./utils/github/getCreatorIssues";
import getMentionedIssues from "./utils/github/getMentionedIssues";
import getDailySummary from "./utils/github/getDailySummary";

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

  let numberOfFileChanges: number = 0;
  if (vscode.window.activeTextEditor) {
    try {
      numberOfFileChanges = await getNumberOfFileChanges(
        vscode.window.activeTextEditor?.document.uri.fsPath || ".",
        gitAPI as any
      );
    } catch {
      console.error("numberOfFileChanges", numberOfFileChanges);
    }
  }
  // create the hover provider
  let wmHover = hover({ reporter, numberOfFileChanges });

  let { repoName, ownerUsername } = await getRepoInfo();
  repo = repoName;
  owner = ownerUsername;
  reporter.sendTelemetryEvent("repoInfo", { owner, repo });

  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });

  octokit = await credentials.getOctokit();
  getGitHubUserInfo({ octokit }).then(async (githubUserInfo) => {
    username = githubUserInfo.login;
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      },
    });
  });
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
    ),
    vscode.commands.registerCommand("watermelon.show", async () => {
      vscode.commands.executeCommand("watermelon.sidebar.focus");
    }),
    vscode.commands.registerCommand("watermelon.select", async () => {
      vscode.commands.executeCommand("editor.action.smartSelect.expand");
    }),
    vscode.commands.registerCommand(
      "watermelon.multiSelect",
      async (times = 4) => {
        for (let index = 0; index < times; index++) {
          vscode.commands.executeCommand("editor.action.smartSelect.expand");
        }
      }
    ),
    vscode.commands.registerCommand(
      "watermelon.blame",
      async (startLine = undefined, endLine = undefined) => {
        vscode.commands.executeCommand("watermelon.show");
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
      }
    ),
    vscode.commands.registerCommand("watermelon.docs", async () => {
      //get current filepath with vs code
      let filePath = vscode.window.activeTextEditor?.document.uri
        .fsPath as string;
      let mdFilePath = filePath + ".md";
      let mdFile = await vscode.workspace.openTextDocument(mdFilePath);
      // open md file on a split view
      vscode.window.showTextDocument(mdFile, {
        viewColumn: vscode.ViewColumn.Beside,
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
