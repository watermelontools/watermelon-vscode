import * as vscode from "vscode";
import { Octokit } from "@octokit/core";
import { Credentials } from "./credentials";
import getWebviewOptions from "./utils/getWebViewOptions";
import getNonce from "./utils/getNonce";
import getGitAPI from "./utils/getGitAPI";
import { watermelonBannerImageURL } from "./constants";
import getInitialHTML from "./utils/getInitialHTML";
import getSHAArray from "./utils/getSHAArray";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getLocalUser from "./utils/vscode/getLocalUser";
import getRepoInfo from "./utils/vscode/getRepoInfo";

// selection ranges should be a global var
let startLine = 0;
let endLine = 0;

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.start", async () => {
      let { repoName, ownerUsername } = await getRepoInfo();
        repo = repoName;
        owner = ownerUsername;
      localUser = await getLocalUser();

      octokit = await credentials.getOctokit();


      getPRsPerSHAs();
      watermelonPanel.createOrShow(context.extensionUri);
    })
  );
  vscode.authentication.getSession("github", []).then((session: any) => {
    vscode.commands.executeCommand(
      "setContext",
      "watermelon.isLoggedInGithub",
      true
    );
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
    vscode.window.registerWebviewPanelSerializer(watermelonPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        watermelonPanel.revive(webviewPanel, context.extensionUri);
      },
    });
  }
}

function getPRsPerSHAs() {
  watermelonPanel.currentPanel?.doRefactor({
    command: "loading",
  });
  octokit
    .request(`GET /search/issues?type=Commits`, {
      org: owner,
      q: `hash:${arrayOfSHAs[0]}`,
    })
    .then((octorespSearch: any) => {
      const issuesBySHAs = octorespSearch.data.items;
      if (issuesBySHAs.length === 0) {
        vscode.window.showErrorMessage(
          "No search results. Try selecting a bigger piece of code or another file."
        );
      } else {
        let issuesWithTitlesAndGroupedComments: {
          user: any;
          title: string;
          comments: any[];
          created_at: any;
        }[] = [];

        issuesBySHAs.forEach(async (issue: { url: any }) => {
          const issueUrl = issue.url;
          let prTitlesPushed: string[] = [];

          await octokit.request(`GET ${issueUrl}/comments`).then(
            async (octoresp: {
              data: {
                issue_url: any;
                body: string;
                user: any;
                title: string;
                comments: any[];
                created_at: any;
              }[];
            }) => {
              // this paints the panel
              octoresp.data.forEach(
                async (issue: {
                  issue_url: any;
                  body: string;
                  user: any;
                  title: string;
                  comments: any[];
                  created_at: any;
                }) => {
                  const issueUrl = issue.issue_url;

                  await octokit
                    .request(`GET ${issueUrl}`)
                    .then((octoresp2: { data: { title: string } }) => {
                      let prTitle = "";
                      prTitle = octoresp2.data.title;
                      issue.title = prTitle;

                      if (prTitlesPushed.includes(prTitle)) {
                        for (
                          let i = 0;
                          i < issuesWithTitlesAndGroupedComments.length;
                          i++
                        ) {
                          if (issue.title === prTitle) {
                            if (
                              !issuesWithTitlesAndGroupedComments[
                                i
                              ].comments.includes(issue.body)
                            ) {
                              issuesWithTitlesAndGroupedComments[
                                i
                              ].comments.push(issue.body);
                            }
                          }
                        }
                      } else {
                        prTitlesPushed.push(prTitle);
                        issuesWithTitlesAndGroupedComments.push({
                          user: issue.user.login,
                          title: issue.title,
                          comments: [issue.body + "\n\n"],
                          created_at: issue.created_at,
                        });
                      }
                    });
                  // NOTE: It works here but it keeps adding stuff to the UI. They stack up and only the last execution of this line renders stuff correctly.
                  // QUESTION: Is there a way to do a refactor that re-starts the DOM, instead of stalking up staff on it?
                  watermelonPanel.currentPanel?.doRefactor({
                    command: "prs",
                    data: issuesWithTitlesAndGroupedComments,
                  });
                }
              );
            }
          );
        });
      }
    })
    .catch((error: any) => console.log("octoERR", error));
}

/**
 * Manages watermelon webview panel
 */
class watermelonPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: watermelonPanel | undefined;

  public static readonly viewType = "watermelon";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : undefined;

    // If we already have a panel, show it.
    if (watermelonPanel.currentPanel) {
      watermelonPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      watermelonPanel.viewType,
      "Watermelon",
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri)
    );

    watermelonPanel.currentPanel = new watermelonPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    watermelonPanel.currentPanel = new watermelonPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor(message: object) {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage(message);
  }

  // public paintPanel (message:object) {
  // 	this._panel.webview.postMessage(message);
  // }

  public dispose() {
    watermelonPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update(title: string = "") {
    const webview = this._panel.webview;
    if (title) {
      this._panel.title = title;
    }
    this._panel.webview.html = this._getHtmlForWebview(
      webview,
      watermelonBannerImageURL
    );
  }

  private _getHtmlForWebview(webview: vscode.Webview, imagePath: string) {
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
    return getInitialHTML(webview, stylesMainUri, imagePath, nonce, scriptUri);
  }
}
