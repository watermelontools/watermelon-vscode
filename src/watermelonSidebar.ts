import getNonce from "./utils/vscode/getNonce";
import getInitialHTML from "./utils/vscode/getInitialHTML";
import * as vscode from "vscode";
import getGitAPI from "./utils/vscode/getGitAPI";
import getLocalUser from "./utils/vscode/getLocalUser";
import getSHAArray from "./utils/getSHAArray";
import { Credentials } from "./credentials";
import getPRsToPaintPerSHAs from "./utils/vscode/getPRsToPaintPerSHAs";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getBlame from "./utils/getBlame";
import TelemetryReporter from "@vscode/extension-telemetry";
import starWmRepo from "./utils/github/starWmRepo";
import {
  WATERMELON_HISTORY_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "./constants";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// user information
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let octokit: any;
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
      let gitAPI = await getGitAPI();
      let repoInfo = await getRepoInfo({});
      localUser = await getLocalUser();
      repo = repoInfo?.repo;
      owner = repoInfo?.owner;
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
        case "blame": {
          // Send Event to VSC Telemtry Library
          this.reporter?.sendTelemetryEvent("viewBlame");

          this.sendMessage({
            command: "loading",
          });
          vscode.commands.executeCommand(WATERMELON_HISTORY_COMMAND);

          break;
        }
        case "star": {
          const credentials = new Credentials();
          await credentials.initialize(this._context);
          octokit = await credentials.getOctokit();
          await starWmRepo({ octokit });
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
    if (message?.author) {
      return getInitialHTML(
        webview,
        stylesMainUri,
        codiconsUri,
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
        codiconsUri,
        darkLogo,
        lightLogo,
        nonce,
        scriptUri
      );
    }
  }
}
