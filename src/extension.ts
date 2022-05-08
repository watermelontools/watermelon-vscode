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
import getUserEmail from "./utils/getUserEmail";
import searchType from "./utils/analytics/searchType";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";

import watermelonSidebar from "./watermelonSidebar";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// user information
let userEmail: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];
// Selected block of code
// codeExplanation
let selectedBlockOfCode: string | undefined = "";

let octokit: any;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);
  var extensionPath = Path.join(context.extensionPath, "package.json");
  var packageFile = JSON.parse(fs.readFileSync(extensionPath, "utf8"));

  if (packageFile) {
    console.log(packageFile.version);
  }
  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);

  const provider = new watermelonSidebar(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      watermelonSidebar.viewType,
      provider
    )
  );
  let { repoName, ownerUsername } = await getRepoInfo();
  repo = repoName;
  owner = ownerUsername;
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.start", async () => {
      provider.sendMessage({
        command: "loading",
      });
      localUser = await getLocalUser();

      octokit = await credentials.getOctokit();
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
      userEmail = await getUserEmail({ octokit });
      searchType({
        searchType: "watermelon.start",
        owner,
        repo,
        localUser,
        userEmail,
      });
    })
  );

  vscode.authentication.getSession("github", []).then((session: any) => {
    setLoggedIn(true);
  });
  octokit = await credentials.getOctokit();

  vscode.window.onDidChangeTextEditorSelection(async (selection) => {
    // // Get text of selected piece of code
    let selectedCode = "";
    if (selection.selections.length > 0) {
      let selectedText = selection;
      selectedCode= selectedText.textEditor.document.getText(selectedText.selections[0]);
    }
    // Replace newlines with \n
    selectedBlockOfCode = selectedCode.replace(/(\r\n|\n|\r)/gm,"");
    
    arrayOfSHAs = await getSHAArray(
      selection.selections[0].start.line,
      selection.selections[0].end.line,
      vscode.window.activeTextEditor?.document.uri.fsPath,
      gitAPI
    );
  });

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(watermelonSidebar.viewType, {
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

