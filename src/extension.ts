import * as vscode from "vscode";
import getBlame from "./utils/getBlame";
import getGitAPI from "./utils/vscode/getGitAPI";
import getPackageInfo from "./utils/getPackageInfo";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import analyticsReporter from "./utils/vscode/reporter";
import statusBarItem, {
  updateStatusBarItem,
} from "./utils/components/statusBarItem";
import hover from "./utils/components/hover";
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
import { WatermelonAuthenticationProvider } from "./auth";
import { ContextItem } from "./ContextItem";
import { getGitItems } from "./utils/treeview/getGitItems";
import { getContext } from "./utils/treeview/getContext";
import setLoading from "./utils/vscode/setLoading";
import addToRecommendedCommandHandler from "./utils/commands/addToRecommended";
import richHover from "./utils/components/richHover";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
let repoSource: string | undefined = "";

let startLine: any = undefined;
let endLine: any = undefined;

// extension version will be reported as a property with each event
const extensionVersion = getPackageInfo().version;

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
    const items: ContextItem[] = [];
    let gitAPI = await getGitAPI();
    debugLogger(`got gitAPI`);
    let reporter = analyticsReporter();
    let repoInfo = await getRepoInfo({ reporter });
    repoSource = repoInfo?.source;
    repo = repoInfo?.repo;
    owner = repoInfo?.owner;
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (!session || session === undefined) {
      setLoggedIn(false);
      return items;
    }
    setLoggedIn(true);
    setLoading(true);
    let uniqueBlames;

    if (
      (startLine === undefined && endLine === undefined) ||
      startLine === endLine
    ) {
      uniqueBlames = await getBlame(
        gitAPI,
        1,
        vscode.window.activeTextEditor?.document.lineCount ?? 2
      );
    } else {
      uniqueBlames = await getBlame(gitAPI, startLine, endLine);
    }

    if (!session) {
      setLoggedIn(false);
      return items;
    }
    const [contextItems] = await Promise.all([
      getContext({
        email: session?.account.label || "",
        repo,
        owner,
        uniqueBlames,
      }),
    ]);

    reporter?.sendTelemetryEvent("getCodeContext");
    setLoading(false);
    return [...contextItems];
  }
}

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);

  // allows saving state across sessions
  const workspaceState: { repo: string; owner: string } | undefined =
    context.workspaceState.get("workspaceState");
  debugLogger(`workspaceState: ${JSON.stringify(workspaceState)}`);
  // create telemetry reporter on extension activation
  let reporter = analyticsReporter();
  reporter?.sendTelemetryEvent("extensionActivated");
  let repoInfo = await getRepoInfo({ reporter });
  repo = repoInfo?.repo ? repoInfo?.repo : workspaceState?.repo;
  owner = repoInfo?.owner ? repoInfo?.owner : workspaceState?.owner;
  debugLogger(`repo: ${repo}`);
  debugLogger(`owner: ${owner}`);

  context.workspaceState.update("workspaceState", {
    ...workspaceState,
    repo: repo ? repo : workspaceState?.repo,
    owner: owner ? owner : workspaceState?.owner,
  });
  owner && repo && reporter?.sendTelemetryEvent("repoInfo", { owner, repo });
  let watermelonTreeDataProvider = new WatermelonTreeDataProvider();
  // register for Explorer view
  vscode.window.registerTreeDataProvider(
    "watermelonExplorerTreeProvider",
    watermelonTreeDataProvider
  );
  // register for Watermelon view
  vscode.window.registerTreeDataProvider(
    "watermelonTreeProvider",
    watermelonTreeDataProvider
  );

  let wmStatusBarItem = statusBarItem();
  debugLogger("created wmStatusBarItem");

  context.subscriptions.push(
    // treeview
    vscode.window.createTreeView("watermelonExplorerTreeProvider", {
      treeDataProvider: watermelonTreeDataProvider,
    }),
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
      async handleUri(uri) {
        // show a hello message
        const urlSearchParams = new URLSearchParams(uri.query);
        const params = Object.fromEntries(urlSearchParams.entries());
        await context.secrets.store("watermelonToken", params.token);
        await context.secrets.store("watermelonEmail", params.email);
        vscode.authentication.getSession(
          WatermelonAuthenticationProvider.id,
          [],
          {
            createIfNone: false,
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

  // create the hover providers
  hover({ reporter });
  richHover({ reporter });
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

  let prsCommandHandler = async (
    startLine = undefined,
    endLine = undefined
  ) => {
    vscode.commands.executeCommand(WATERMELON_SHOW_COMMAND);

    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (session) {
      setLoggedIn(true);
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
    vscode.commands.executeCommand("watermelonTreeProvider.focus");
    reporter?.sendTelemetryEvent("showCommand");
  };
  let linkCommandHandler = async ({
    url,
    source,
  }: {
    url: string;
    source?: string;
  }) => {
    vscode.commands.executeCommand("watermelonTreeProvider.focus");
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
    startLine = selection.selections[0].start.line;
    endLine = selection.selections[0].end.line;
    updateStatusBarItem(wmStatusBarItem);
  });
}

// Not used yet
// Allows cleanup
export function deactivate() {}
