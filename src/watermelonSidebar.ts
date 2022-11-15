import getNonce from "./utils/vscode/getNonce";
import getInitialHTML from "./utils/vscode/getInitialHTML";
import * as vscode from "vscode";
import TelemetryReporter from "@vscode/extension-telemetry";
import starWmRepo from "./utils/github/starWmRepo";
import {
  WATERMELON_LOGIN_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "./constants";

/**
 * Manages watermelon webview panel
 */
export default class WatermelonSidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "watermelon.sidebar";
  public _extensionUri: vscode.Uri;
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  constructor(
    private readonly context: vscode.ExtensionContext,
    public reporter: TelemetryReporter | null = null
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
          this.reporter?.sendTelemetryEvent(data.source, { link: data.link });
          vscode.env.openExternal(vscode.Uri.parse(data.link));
          break;
        }
        case "login": {
          vscode.commands.executeCommand(WATERMELON_LOGIN_COMMAND);
          this.reporter?.sendTelemetryEvent("login");
          vscode.commands.executeCommand(WATERMELON_PULLS_COMMAND);
          break;
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
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "main.js"
    );
    // And the uri we use to load this script in the webview
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
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
