import * as vscode from "vscode";
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
import analyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
import getGitHubDailySummary from "./utils/github/getDailySummary";
import {
  EXTENSION_ID,
  WATERMELON_ADD_TO_RECOMMENDED_COMMAND,
  WATERMELON_LOGIN_COMMAND,
  WATERMELON_MULTI_SELECT_COMMAND,
  WATERMELON_OPEN_LINK_COMMAND,
  WATERMELON_PULLS_COMMAND,
  WATERMELON_SELECT_COMMAND,
  WATERMELON_SHOW_COMMAND,
} from "./constants";
import multiSelectCommandHandler from "./utils/commands/multiSelect";
import selectCommandHandler from "./utils/commands/select";
import debugLogger from "./utils/vscode/debugLogger";
import checkIfUserStarred from "./utils/github/checkIfUserStarred";
import getMostRelevantJiraTickets from "./utils/jira/getMostRelevantJiraTickets";
import getAssignedJiraTickets from "./utils/jira/getAssignedJiraTickets";
import { WatermelonAuthenticationProvider } from "./auth";
import searchMessagesByText from "./utils/slack/searchMessagesByText";
import path = require("path");
import getPlural from "./utils/others/text/getPlural";
import dateToHumanReadable from "./utils/others/text/dateToHumanReadable";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

let startLine: any = undefined;
let endLine: any = undefined;

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;
export class ContextItem extends vscode.TreeItem {
  children: any;
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly version: string,
    public readonly command?: vscode.Command,
    children?: ContextItem[]
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
    this.children = children;
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "images", "wmbw_bold_fill.svg"),
    dark: path.join(__filename, "..", "..", "images", "wmbw_bold_fill.svg"),
  };

  contextValue = "dependency";
}
export class WatermelonTreeDataProvider
  implements vscode.TreeDataProvider<ContextItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ContextItem | undefined | void
  > = new vscode.EventEmitter<ContextItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ContextItem | undefined | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ContextItem): vscode.TreeItem {
    return element;
  }
  getChildren(element?: ContextItem): Thenable<ContextItem[]> {
    if (element) {
      return Promise.resolve(element.children);
    } else {
      return Promise.resolve(this.getTopLevelItems());
    }
  }

  private async getTopLevelItems(): Promise<ContextItem[]> {
    const items: ContextItem[] = [
      new ContextItem(
        Date.now().toLocaleString(),
        vscode.TreeItemCollapsibleState.Expanded,
        "jira",
        undefined,
        [
          new ContextItem(
            "jira1",
            vscode.TreeItemCollapsibleState.Collapsed,
            "jira1"
          ),
          new ContextItem(
            Date.now().toLocaleString(),
            vscode.TreeItemCollapsibleState.Expanded,
            "jira2"
          ),
        ]
      ),
    ];

    console.log("items", items);
    return items;
  }
}

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);
  let watermelonTreeDataProvider = new WatermelonTreeDataProvider();
  context.subscriptions.push(
    vscode.window.createTreeView("watermelonExplorerTreeProvider", {
      treeDataProvider: watermelonTreeDataProvider,
    })
  );
  vscode.window.registerTreeDataProvider(
    "watermelonExplorerTreeProvider",
    watermelonTreeDataProvider
  );
  const workspaceState: object | undefined =
    context.workspaceState.get("workspaceState");
  debugLogger(`workspaceState: ${JSON.stringify(workspaceState)}`);
  // create telemetry reporter on extension activation
  let reporter = analyticsReporter();
  reporter?.sendTelemetryEvent("extensionActivated");

  const provider = new WatermelonSidebar(context, reporter);
  debugLogger(`created provider`);

  let wmStatusBarItem = statusBarItem();
  debugLogger(`created wmStatusBarItem`);

  context.subscriptions.push(
    // webview
    vscode.window.registerWebviewViewProvider(
      WatermelonSidebar.viewType,
      provider
    ),
    // action bar item
    wmStatusBarItem,
    // register some listener that make sure the status bar
    // item always up-to-date
    vscode.window.onDidChangeActiveTextEditor(async () => {
      updateStatusBarItem(wmStatusBarItem);
    }),
    // allow wm auth
    vscode.authentication.registerAuthenticationProvider(
      WatermelonAuthenticationProvider.id,
      "Watermelon Auth",
      new WatermelonAuthenticationProvider(context)
    ),
    vscode.window.registerUriHandler({
      handleUri(uri) {
        // show a hello message
        vscode.window.showInformationMessage("URI" + uri);
        const urlSearchParams = new URLSearchParams(uri.query);
        const params = Object.fromEntries(urlSearchParams.entries());
        context.secrets.store("watermelonToken", params.token);
        context.secrets.store("watermelonEmail", params.email);
        vscode.authentication.getSession(
          WatermelonAuthenticationProvider.id,
          [],
          {
            createIfNone: true,
          }
        );
      },
    })
  );
  if (reporter) {
    context.subscriptions.push(
      // ensure reporter gets properly disposed. Upon disposal the events will be flushed
      reporter
    );
  }
  // update status bar item once at start
  updateStatusBarItem(wmStatusBarItem);

  // create the hover provider
  let wmHover = hover({ reporter });

  let loginCommandHandler = async () => {
    // Get our PAT session.
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      [],
      { createIfNone: true }
    );
    if (session) {
      // We have a session, so we're logged in.
      setLoggedIn(true);
      vscode.window.showInformationMessage(`Welcome ${session.account.label}`);
    }
  };
  let addToRecommendedCommandHandler = async () => {
    vscode.commands.executeCommand(
      "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
      EXTENSION_ID
    );
  };

  let prsCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);
    provider.sendMessage({
      command: "loading",
    });
    console.log("prsCommandHandler");
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (session) {
      console.log("session");
      watermelonTreeDataProvider.refresh();

      context.workspaceState.update("session", {
        ...session,
      });
    } else {
      vscode.window.showInformationMessage(`Please login first`);
    }
  };
  let showCommandHandler = async () => {
    // @ts-ignore
    context.globalState.update(
      "openSidebarCount",
      (context.globalState.get("openSidebarCount") as number) + 1
    );
    if (
      context.globalState.get<number>("openSidebarCount") &&
      // @ts-ignore
      context.globalState.get<Number>("openSidebarCount") % 3 === 0
    ) {
      provider.sendMessage({
        command: "talkToCTO",
      });
    }
    vscode.commands.executeCommand("watermelon.sidebar.focus");
    reporter?.sendTelemetryEvent("showCommand");
  };
  let linkCommandHandler = async ({
    url,
    source,
  }: {
    url: string;
    source?: string;
  }) => {
    vscode.commands.executeCommand("watermelon.sidebar.focus");
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
    reporter?.sendTelemetryEvent("linkCommand", {
      url,
      source: source || "unknown",
    });
  };
  context.subscriptions.push(
    vscode.commands.registerCommand(
      WATERMELON_SHOW_COMMAND,
      showCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_SELECT_COMMAND,
      selectCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_MULTI_SELECT_COMMAND,
      multiSelectCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_PULLS_COMMAND,
      prsCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_LOGIN_COMMAND,
      loginCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_ADD_TO_RECOMMENDED_COMMAND,
      addToRecommendedCommandHandler
    ),
    vscode.commands.registerCommand(
      WATERMELON_OPEN_LINK_COMMAND,
      linkCommandHandler
    )
  );

  vscode.window.onDidChangeTextEditorSelection(async (selection) => {
    let gitAPI = await getGitAPI();
    updateStatusBarItem(wmStatusBarItem);
    arrayOfSHAs = await getSHAArray(
      selection.selections[0].start.line,
      selection.selections[0].end.line,
      vscode.window.activeTextEditor?.document.uri.fsPath,
      gitAPI
    );
    debugLogger(`arrayOfSHAs: ${JSON.stringify(arrayOfSHAs)}`);
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
  let repoInfo = await getRepoInfo({ reporter });
  repo = repoInfo?.repo;
  owner = repoInfo?.owner;
  debugLogger(`repo: ${repo}`);
  debugLogger(`owner: ${owner}`);
  context.workspaceState.update("workspaceState", {
    ...workspaceState,
    repo,
    owner,
  });
  owner && repo && reporter?.sendTelemetryEvent("repoInfo", { owner, repo });

  provider.sendMessage({
    command: "versionInfo",
    data: extensionVersion,
  });
}

// Not used yet
// Allows cleanup
export function deactivate() {}
