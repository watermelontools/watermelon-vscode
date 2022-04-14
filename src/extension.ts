import * as vscode from "vscode";
import { Credentials } from "./credentials";
import getWebviewOptions from "./utils/vscode/getWebViewOptions";
import getNonce from "./utils/vscode/getNonce";
import getGitAPI from "./utils/vscode/getGitAPI";
import { watermelonBannerImageURL } from "./constants";
import getInitialHTML from "./utils/vscode/getInitialHTML";
import getSHAArray from "./utils/getSHAArray";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getLocalUser from "./utils/vscode/getLocalUser";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getUserEmail from "./utils/getUserEmail";
import searchType from "./utils/analytics/searchType";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import { ConsoleReporter } from "@vscode/test-electron";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// user information
let userEmail: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);

  const provider = new watermelonSidebar(context.extensionUri);

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

      let issuesWithTitlesAndGroupedComments = await getPRsToPaintPerSHAs({
        arrayOfSHAs,
        octokit,
        owner,
        repo,
      });
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

  // Watermelon Slack command
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.slack", async () => {
      console.log("watermelon.slack called")
    })
  );

  vscode.authentication.getSession("github", []).then((session: any) => {
    setLoggedIn(true);
  });
  octokit = await credentials.getOctokit();

  vscode.window.onDidChangeTextEditorSelection(async (selection) => {
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

class watermelonSidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "watermelon.sidebar";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "run": {
          this.sendMessage({
            command: "loading",
          });
          userEmail = await getUserEmail({ octokit });
          localUser = await getLocalUser();

          let issuesWithTitlesAndGroupedComments = await getPRsToPaintPerSHAs({
            arrayOfSHAs,
            octokit,
            owner,
            repo,
          });
          // @ts-ignore
          let sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
            (a:any, b: any) => b.comments.length - a.comments.length
          );
          searchType({
            searchType: "webview.button",
            owner,
            repo,
            localUser,
            userEmail,
          });
          this.sendMessage({
            command: "prs",
            data: sortedPRs,
          });
          break;
        }
      }
    });
  }
  public sendMessage(message: any) {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage(message);
    }
  }
  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "main.js"
    );
    // And the uri we use to load this script in the webview
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });

    // Local path to css styles
    //const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathMainPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "vscode.css"
    );

    // Uri to load styles into webview
    //const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    return getInitialHTML(
      webview,
      stylesMainUri,
      watermelonBannerImageURL,
      nonce,
      scriptUri
    );
  }
}
/**
 * Manages watermelon webview panel
 */
