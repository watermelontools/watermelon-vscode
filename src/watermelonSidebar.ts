import createDocs from "./utils/analytics/createDocs";
import getNonce from "./utils/vscode/getNonce";
import getInitialHTML from "./utils/vscode/getInitialHTML";
import * as vscode from "vscode";
import getGitAPI from "./utils/vscode/getGitAPI";
import getUserEmail from "./utils/getUserEmail";
import getLocalUser from "./utils/vscode/getLocalUser";
import getSHAArray from "./utils/getSHAArray";
import { Credentials } from "./credentials";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getBlame from "./utils/getBlame";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// user information
let userEmail: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

export default class WatermelonSidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "watermelon.sidebar";
  public _extensionUri: vscode.Uri;
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  constructor(
    private readonly context: vscode.ExtensionContext,
    public reporter: any
  ) {
    this._extensionUri = context.extensionUri;
    this._context = context;
    this.reporter = reporter;
  }
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
      const credentials = new Credentials();
      await credentials.initialize(this._context);
      octokit = await credentials.getOctokit();
      let gitAPI = await getGitAPI();
      let { repoName, ownerUsername } = await getRepoInfo();
      userEmail = await getUserEmail({ octokit });
      localUser = await getLocalUser();
      repo = repoName;
      owner = ownerUsername;
      switch (data.command) {
        case "run": {
          this.sendMessage({
            command: "loading",
          });

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
            return this.sendMessage({
              command: "error",
              error: issuesWithTitlesAndGroupedComments,
            });
          }
          // @ts-ignore
          let sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
            (a: any, b: any) => b.comments.length - a.comments.length
          );

          // Send Event to VSC Telemtry Library
          this.reporter.sendTelemetryEvent("pullRequests");

          this.sendMessage({
            command: "prs",
            data: sortedPRs,
          });
          break;
        }
        case "create-docs": {
          // Send Event to VSC Telemtry Library
          this.reporter.sendTelemetryEvent("createDocs");

          const wsedit = new vscode.WorkspaceEdit();
          if (vscode.workspace.workspaceFolders) {
            const wsPath = vscode?.workspace?.workspaceFolders[0].uri.fsPath; // gets the path of the first workspace folder
            const folderPath = vscode.Uri.file(wsPath + "/wm-paper/");
            const filePath = vscode.Uri.file(wsPath + "/wm-paper/index.md");
            wsedit.createFile(folderPath, { ignoreIfExists: true });
            wsedit.createFile(filePath, { ignoreIfExists: true });
            vscode.workspace.applyEdit(wsedit);
            vscode.window.showInformationMessage(
              "Created a new file: wm-paper/index.md"
            );
            vscode.workspace.openTextDocument(filePath).then(
              (doc: vscode.TextDocument) => {
                vscode.window
                  .showTextDocument(doc, vscode.ViewColumn.Beside, false)
                  .then((e) => {
                    e.edit((edit) => {
                      edit.insert(
                        new vscode.Position(0, 0),
                        `# ${repo} by ${owner} \n`
                      );
                      edit.insert(new vscode.Position(1, 0), `\n`);
                      edit.insert(new vscode.Position(2, 0), `## Intro \n`);
                      edit.insert(new vscode.Position(3, 0), `\n`);
                      edit.insert(
                        new vscode.Position(4, 0),
                        `## How to run this project \n`
                      );
                      edit.insert(new vscode.Position(5, 0), `\n`);
                      edit.insert(
                        new vscode.Position(6, 0),
                        `## Important links \n`
                      );
                    });
                  });
              },
              (error: any) => {
                console.error(error);
                debugger;
              }
            );
          }
          break;
        }
        case "blame": {
          // Send Event to VSC Telemtry Library
          this.reporter.sendTelemetryEvent("viewBlame");

          this.sendMessage({
            command: "loading",
          });
          let uniqueBlames = await getBlame(gitAPI);
          this.sendMessage({
            command: "blame",
            data: uniqueBlames,
            owner,
            repo,
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
  public sendSilentMessage(message: any) {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(
        this._view.webview,
        message
      );
    }
  }
  private _getHtmlForWebview(
    webview: vscode.Webview,
    message: { author?: string } = {}
  ) {
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
    const darkLogo = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "imagotype-white.png")
    );
    const lightLogo = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "imagotype-white.png")
    );
    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    if (message?.author) {
      return getInitialHTML(
        webview,
        stylesMainUri,
        darkLogo,
        lightLogo,
        nonce,
        scriptUri,
        message.author
      );
    } else {
      return getInitialHTML(
        webview,
        stylesMainUri,
        darkLogo,
        lightLogo,
        nonce,
        scriptUri
      );
    }
  }
}
/**
 * Manages watermelon webview panel
 */
