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
import searchType from "./utils/analytics/searchType";

const axios = require('axios').default;

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

  const provider = new watermelonSidebar(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      watermelonSidebar.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("watermelon.start", async () => {
      let { repoName, ownerUsername } = await getRepoInfo();
      repo = repoName;
      owner = ownerUsername;
      localUser = await getLocalUser();

      octokit = await credentials.getOctokit();

      getPRsPerSHAs();
      searchType({ searchType: "watermelon.start", owner, repo });
    })
  );

  vscode.authentication.getSession("github", []).then((session: any) => {
    setLoggedIn(true)
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

  function getPRsPerSHAs() {
    // takes the first 22 shas and creates a list to send to the gh api
    let joinedArrayOfSHAs = arrayOfSHAs.slice(0,22).join();

    axios.get('https://app.watermelon.tools/api/github/getIsWithinPlan', {
      data: {
        "organizationName": owner
      }
    })
      .then(function (response: any) {
        if (response.data.organizationIsWithinPlan === "true") {
          octokit
          .request(`GET /search/issues?type=Commits`, {
            org: owner,
            q: joinedArrayOfSHAs,
          })    
          .then((octorespSearch: any) => {
            const issuesBySHAs = octorespSearch.data.items;
            if (issuesBySHAs.length === 0) {
              vscode.window.showErrorMessage(
                "No search results. Try selecting a bigger piece of code or another file."
              );
            } else {
              // Increase organizational query counter value
              axios.post('https://app.watermelon.tools/api/github/countUserQueries', {
                "organizationName": owner
              })
              .then(function (response: any) {
                console.log(response);
              })
              .catch(function (error: any) {
                console.log(error);
              });

              // Fetch information
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
                        provider.sendMessage({
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
        } else {
          // usageIsWithinTier = false;
          vscode.window.showErrorMessage(
            "You have exceeded the number of search queries your 🍉 plan allows you to execute. Please go to our website to upgrade your plan."
          );
        }
      })
      .catch(function (error: any) {
        // handle error
        console.log(error);
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

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "colorSelected": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`aaaaaa`)
          );
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
