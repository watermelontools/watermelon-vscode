import * as vscode from "vscode";
import getBlame from "./utils/getBlame";
import getSHAArray from "./utils/getSHAArray";
import getGitAPI from "./utils/vscode/getGitAPI";
import getPackageInfo from "./utils/getPackageInfo";
import setLoggedIn from "./utils/vscode/setLoggedIn";
import getRepoInfo from "./utils/vscode/getRepoInfo";
import getGitHubUserInfo from "./utils/getGitHubUserInfo";
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
import getPlural from "./utils/others/text/getPlural";
import dateToHumanReadable from "./utils/others/text/dateToHumanReadable";
import { ContextItem } from "./ContextItem";

// repo information
let owner: string | undefined = "";
let repo: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

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
    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (startLine === undefined && endLine === undefined) {
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
        email: session?.account.label || "",
        owner,
        repo,
      });
      let sortedPRs: any[] = [];
      if (Array.isArray(issuesWithTitlesAndGroupedComments)) {
        sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
          (a: any, b: any) => b.comments.length - a.comments.length
        );
        let gitHubItems = sortedPRs.map((pr: any) => {
          return new ContextItem(
            pr.title,
            vscode.TreeItemCollapsibleState.Collapsed,
            `${pr.comments.length.toString()} comment${getPlural(
              pr.comments.length
            )}`,
            {
              command: WATERMELON_OPEN_LINK_COMMAND,
              title: "View PR",
              arguments: [pr.url],
            },
            pr.comments.map((comment: any) => {
              return new ContextItem(
                comment.user.login,
                vscode.TreeItemCollapsibleState.None,
                comment.created_at,
                {
                  command: WATERMELON_OPEN_LINK_COMMAND,
                  title: "View comment",
                  arguments: [comment.userLink],
                },
                [
                  new ContextItem(
                    comment.body,
                    vscode.TreeItemCollapsibleState.None,
                    dateToHumanReadable(comment.created_at),
                    {
                      command: WATERMELON_OPEN_LINK_COMMAND,
                      title: "View comment",
                      arguments: [comment.url],
                    }
                  ),
                ]
              );
            })
          );
        });
        items.push(
          new ContextItem(
            "GitHub",
            vscode.TreeItemCollapsibleState.Collapsed,
            `${sortedPRs.length.toString()} PR${getPlural(sortedPRs.length)}`,
            undefined,
            gitHubItems,
            "github"
          )
        );
      } else {
        items.push(
          new ContextItem(
            "GitHub",
            vscode.TreeItemCollapsibleState.None,
            `No PRs found`,
            undefined,
            undefined,
            "github"
          )
        );
      }

      let uniqueBlames = await getBlame(gitAPI, startLine, endLine);
      let commitItems = uniqueBlames.map((commit: any) => {
        return new ContextItem(
          commit.message,
          vscode.TreeItemCollapsibleState.Collapsed,
          dateToHumanReadable(new Date(commit.commitDate)),
          undefined,
          [
            new ContextItem(
              commit.authorName,
              vscode.TreeItemCollapsibleState.None,
              commit.hash.slice(0, 7),
              undefined
            ),
          ]
        );
      });
      items.push(
        new ContextItem(
          "Git",
          vscode.TreeItemCollapsibleState.Collapsed,
          `${uniqueBlames.length.toString()} commit${getPlural(
            uniqueBlames.length
          )}`,
          undefined,
          commitItems,
          "git"
        )
      );

      const parsedCommitObject = new Object(uniqueBlames[0]) as {
        date: string;
        message: string;
        author: string;
        email: string;
        commit: string;
        body: string;
        sha: string;
      };
      const parsedMessage = parsedCommitObject.message;
      debugLogger(`parsedMessage: ${parsedMessage}`);
      // Jira
      if (!session) {
        return items;
      }
      const mostRelevantJiraTickets =
        (await getMostRelevantJiraTickets({
          user: session?.account.label,
          prTitle: sortedPRs[0]?.title || parsedMessage,
        })) || {};
      const jiraItems = mostRelevantJiraTickets?.map((ticket) => {
        return new ContextItem(
          ticket.key,
          vscode.TreeItemCollapsibleState.Collapsed,
          ticket.fields.summary,
          {
            command: WATERMELON_OPEN_LINK_COMMAND,
            title: "View Jira ticket",
            arguments: [`${"#"}/browse/${ticket.key}`],
          },
          [
            new ContextItem(
              ticket.renderedFields.description,
              vscode.TreeItemCollapsibleState.Collapsed,
              ticket.renderedFields.created,
              undefined,
              ticket.comments?.map((comment: any) => {
                return new ContextItem(
                  comment.body,
                  vscode.TreeItemCollapsibleState.None,
                  dateToHumanReadable(comment.created),
                  {
                    command: WATERMELON_OPEN_LINK_COMMAND,
                    title: "View comment",
                    arguments: [comment.url],
                  }
                );
              })
            ),
          ]
        );
      });
      if (!jiraItems || jiraItems.length === 0) {
        items.push(
          new ContextItem(
            "Jira",
            vscode.TreeItemCollapsibleState.Collapsed,
            `No Tickets found`,
            undefined,
            undefined,
            "jira"
          )
        );
      } else {
        items.push(
          new ContextItem(
            "Jira",
            vscode.TreeItemCollapsibleState.Collapsed,
            `${mostRelevantJiraTickets.length.toString()} ticket${getPlural(
              mostRelevantJiraTickets.length
            )}`,
            undefined,
            jiraItems ? jiraItems : [],
            "jira"
          )
        );
      }
      // Slack
      const relevantSlackThreads = await searchMessagesByText({
        user: session.account.label,
        email: session.account.label,
        text: sortedPRs[0]?.title || parsedMessage,
      });
      const slackItems = relevantSlackThreads?.map((thread) => {
        return new ContextItem(
          thread.text,
          vscode.TreeItemCollapsibleState.Collapsed,
          thread.channel.name,
          {
            command: WATERMELON_OPEN_LINK_COMMAND,
            title: "View Slack thread",

            arguments: [thread.url],
          },
          thread.replies?.map((message: any) => {
            return new ContextItem(
              message.text,
              vscode.TreeItemCollapsibleState.None,
              dateToHumanReadable(message.ts),
              {
                command: WATERMELON_OPEN_LINK_COMMAND,
                title: "View comment",
                arguments: [message.url],
              }
            );
          })
        );
      });
      if (!slackItems.length) {
        items.push(
          new ContextItem(
            "Slack",
            vscode.TreeItemCollapsibleState.None,
            `No Threads found`,
            undefined,
            undefined,
            "slack"
          )
        );
      } else {
        items.push(
          new ContextItem(
            "Slack",
            vscode.TreeItemCollapsibleState.Collapsed,
            `${relevantSlackThreads.length.toString()} thread${getPlural(
              relevantSlackThreads.length
            )}`,
            undefined,
            slackItems,
            "slack"
          )
        );
      }
    } else {
      vscode.commands.executeCommand("watermelon.multiSelect");
      arrayOfSHAs = await getSHAArray(
        (startLine && startLine > 1 ? startLine - 1 : startLine) ?? 1,
        endLine
          ? endLine + 1
          : vscode.window.activeTextEditor?.document.lineCount ?? 2,
        vscode.window.activeTextEditor?.document.uri.fsPath,
        gitAPI
      );
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
        email: session?.account.label || "",
        owner,
        repo,
      });

      if (!Array.isArray(issuesWithTitlesAndGroupedComments)) {
        /*      return provider.sendMessage({
          command: "error",
          error: issuesWithTitlesAndGroupedComments,
        }); */
        return [];
      }
      let sortedPRs = issuesWithTitlesAndGroupedComments?.sort(
        (a: any, b: any) => b.comments.length - a.comments.length
      );
      let uniqueBlames = await getBlame(gitAPI, startLine, endLine);
      const parsedCommitObject = new Object(uniqueBlames[0]) as {
        date: string;
        message: string;
        author: string;
        email: string;
        commit: string;
        body: string;
        sha: string;
      };
      const parsedMessage = parsedCommitObject.message;
      /*         const mostRelevantJiraTickets =
        (await getMostRelevantJiraTickets({
          user: session.account.label,
          prTitle: sortedPRs[0].title || parsedMessage,
        })) || {}; */
      // @ts-ignore
    }
    return [
      new ContextItem(
        "Code Context",
        vscode.TreeItemCollapsibleState.Expanded,
        "by Watermelon",
        undefined,
        items
      ),
    ];
  }
}

export async function activate(context: vscode.ExtensionContext) {
  setLoggedIn(false);
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
  const workspaceState: object | undefined =
    context.workspaceState.get("workspaceState");
  debugLogger(`workspaceState: ${JSON.stringify(workspaceState)}`);
  // create telemetry reporter on extension activation
  let reporter = analyticsReporter();
  reporter?.sendTelemetryEvent("extensionActivated");

  let wmStatusBarItem = statusBarItem();
  debugLogger(`created wmStatusBarItem`);

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

    const session = await vscode.authentication.getSession(
      WatermelonAuthenticationProvider.id,
      []
    );
    if (session) {
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
}

// Not used yet
// Allows cleanup
export function deactivate() {}
