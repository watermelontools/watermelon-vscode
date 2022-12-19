import path = require("path");
import getNonce from "./utils/vscode/getNonce";
import getInitialHTML from "./utils/vscode/getInitialHTML";
import * as vscode from "vscode";
import TelemetryReporter from "@vscode/extension-telemetry";
import starWmRepo from "./utils/github/starWmRepo";
import {
  WATERMELON_LOGIN_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "./constants";
import postCommentOnTicket from "./utils/jira/postCommentOnTicket";
import postCommentOnIssue from "./utils/github/postCommentOnIssue";
import postOnThread from "./utils/slack/postOnThread";

/**
 * Manages watermelon webview panel
 */
export default class WatermelonSidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "watermelon.sidebar";
  public _extensionUri: vscode.Uri;
  public _extensionPath: string;
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  constructor(
    private readonly context: vscode.ExtensionContext,
    public reporter: TelemetryReporter | null = null
  ) {
    this._extensionUri = context.extensionUri;
    this._extensionPath = context.extensionPath;
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
      //@ts-ignore
      let userEmail = this._context.workspaceState.get("session").email;
      //@ts-ignore
      let repo = this._context.workspaceState.get("workspaceState").repo;
      //@ts-ignore
      let owner = this._context.workspaceState.get("workspaceState").owner;

      switch (data.command) {
        case "run": {
          this.sendMessage({
            command: "loading",
          });
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
          // Send Event to VSC Telemtry Library
          this.reporter?.sendTelemetryEvent("pullRequests");
          break;
        }
        case "star": {
          await starWmRepo({ email: data.email });
          this.sendMessage({
            command: "removedStar",
          });
          break;
        }
        case "link": {
          this.reporter?.sendTelemetryEvent("linkClicked", { link: data.link });
          vscode.env.openExternal(vscode.Uri.parse(data.link));
          break;
        }
        case "login": {
          vscode.commands.executeCommand(WATERMELON_LOGIN_COMMAND);
          this.reporter?.sendTelemetryEvent("login");
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
          break;
        }
        case "jiraComment": {
          postCommentOnTicket({
            email: userEmail,
            issueIdOrKey: data.issueIdOrKey,
            text: data.text,
          });
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
        }
        case "githubComment": {
          postCommentOnIssue({
            email: userEmail,
            repo,
            owner,
            comment_body: data.text,
            issue_number: data.issueKey,
          });
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
        }
        case "slackComment": {
          postOnThread({
            email: userEmail,
            channelId: data.channelId,
            text: data.text,
            threadTS: data.threadTS,
          });
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
        }
        default: {
          this.sendMessage({
            command: "",
          });
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
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "media", "main.js")
    );
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    const jqueryUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "jquery.min.js")
    );
    const sentryUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "sentry.min.js")
    );
    const markedUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "marked.min.js")
    );
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );
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

    return getInitialHTML(
      webview,
      stylesMainUri,
      codiconsUri,
      darkLogo,
      lightLogo,
      nonce,
      scriptUri,
      jqueryUri,
      sentryUri,
      markedUri
    );
  }
}
