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
import updateStatusBarItem from "./utils/vscode/updateStatusBarItem";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import getNumberOfFileChanges from "./utils/getNumberOfFileChanges";
import getAllIssues from "./utils/github/getAllIssues";
import analyticsReporter from "./utils/vscode/reporter";

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

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WatermelonSidebar.viewType,
      provider
    ),
    // ensure reporter gets properly disposed. Upon disposal the events will be flushed
    reporter
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
      const docsCommandUri = vscode.Uri.parse(`command:watermelon.docs?`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[View the history for this line](${blameCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[Get the docs for this file](${docsCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `This file has changed ${numberOfFileChanges} times`
      );
      content.supportHtml = true;
      content.isTrusted = true;
      reporter.sendTelemetryEvent("hover");
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
    username = githubUserInfo.login;
    provider.sendMessage({
      command: "user",
      data: {
        login: githubUserInfo.login,
        avatar: githubUserInfo.avatar_url,
      },
    });
  });
  let globalIssues = await getAllIssues({ octokit });
  let assignedIssues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    assignee: username,
  });
  let creatorIssues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    creator: username,
  });
  let mentionedIssues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    mentioned: username,
  });
  provider.sendMessage({
    command: "dailySummary",
    data: {
      globalIssues: globalIssues,
      assignedIssues: assignedIssues.data,
      creatorIssues: creatorIssues.data,
      mentionedIssues: mentionedIssues.data,
    },
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
