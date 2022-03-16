import * as vscode from "vscode";
import { Octokit } from "@octokit/core";
import { Credentials } from "./credentials";
import getWebviewOptions from "./utils/getWebViewOptions";
import getNonce from "./utils/getNonce";
import getGitAPI from "./utils/getGitAPI";
import { watermelonBannerImageURL } from "./constants";
import getInitialHTML from "./utils/getInitialHTML";
import getSHAArray from "./utils/getSHAArray";

const path = require("path");
const { EOL } = require("os");
// selection ranges should be a global var
let startLine = 0;
let endLine = 0;

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

const currentlyOpenTabfilePath =
  vscode.window.activeTextEditor?.document.uri.fsPath;
let splitPath = currentlyOpenTabfilePath?.split("/");
let fileName = splitPath?.pop()?.split(" ").join("\\ ");
let folderRoute = splitPath?.join("/").split(" ").join("\\ ");

let octokit: any;

export async function activate(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand(
    "setContext",
    "watermelon.isLoggedInGithub",
    false
  );

  let gitAPI = await getGitAPI();
  const credentials = new Credentials();
  await credentials.initialize(context);
  let userInfo: any | undefined = undefined;
  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.start", async () => {
      let config = await (
        await gitAPI?.repositories[0]?.getConfig("remote.origin.url")
      )?.split("/");
      if (config) {
        repo = config[4].split(".")[0];
        owner = config[3];
      }
      localUser = await gitAPI?.repositories[0]?.getGlobalConfig("user.name");
      octokit = await credentials.getOctokit();
      if (octokit) {
        userInfo = await octokit.users.getAuthenticated();
      }

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
  if (octokit) {
    userInfo = await octokit.users.getAuthenticated();
  }
  vscode.window.onDidChangeTextEditorSelection(async (selection) => {
    startLine = selection.selections[0].start.line;
    endLine = selection.selections[0].end.line;
    const currentlyOpenTabfilePath =
      vscode.window.activeTextEditor?.document.uri.fsPath;

    arrayOfSHAs = await getSHAArray(
      startLine,
      endLine,
      currentlyOpenTabfilePath,
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
        issuesBySHAs.forEach((issue: { url: any }) => {
          const issueUrl = issue.url;

          octokit
            .request(`GET ${issueUrl}/comments`)
            .then((octorespComments: any) => {
              // this paints the panel
              watermelonPanel.currentPanel?.doRefactor({
                command: "prs",
                data: octorespComments.data,
              });
              //@ts-ignore
            })
            .catch((err: any) => {
              console.log("octoerr: ", err);
            });
        });
      }
    })
    .catch((error: any) => console.log("octoERR", error));
  // hash:124a9a0ee1d8f1e15e833aff432fbb3b02632105
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
