import * as vscode from 'vscode';
import { Octokit } from "@octokit/core";
import { Credentials } from './credentials';
import getWebviewOptions from './utils/getWebViewOptions';
import getNonce from './utils/getNonce';
import { ConsoleReporter } from '@vscode/test-electron';
import { start } from 'repl';
import { API as BuiltInGitApi, GitExtension } from '../@types/git';
var exec = require('child_process').exec;

const path = require('path')
const {EOL} = require('os');
//@ts-ignore
const octokit = new Octokit({ auth: process.env.GH_TOKEN });


// selection ranges should be a global var
let startLine = 0;
let endLine = 0;

// repo information
let owner:string| undefined = "";
let repo:string| undefined = "";
let localUser: string | undefined = "";
// selected shas
let arrayOfSHAs: string[] = [];

// get repo name and owner basename

/* const gitExtension = vscode?.extensions?.getExtension<GitExtension>('vscode.git')?.exports;
if(gitExtension){
	const git = gitExtension.getAPI(1);
console.log(git)
} */
const cats = {
	'Watermelon': 'https://uploads-ssl.webflow.com/61481c822e33bdb0fc03b217/614825b4a1420225f943ffc1_IMAGOTIPO%20FINAL%201-8.png',
};



const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
let splitPath = currentlyOpenTabfilePath?.split("/");
let fileName = splitPath?.pop()?.split(" ").join("\\ ");
let folderRoute = splitPath?.join("/").split(" ").join("\\ ");


async function getGitAPI():Promise<BuiltInGitApi | undefined> {
	try {
        const extension = vscode?.extensions?.getExtension('vscode.git') as vscode.Extension<GitExtension>;
        if (extension !== undefined) {
            const gitExtension = extension.isActive ? extension.exports : await extension.activate();

            return gitExtension.getAPI(1);
        }
    } catch {}

    return undefined;
}


export async function activate(context: vscode.ExtensionContext) {
	let gitAPI = await getGitAPI()
	const credentials = new Credentials();
	await credentials.initialize(context);

	const disposable = vscode.commands.registerCommand('extension.getGitHubUser', async () => {
		/**
		 * Octokit (https://github.com/octokit/rest.js#readme) is a library for making REST API
		 * calls to GitHub. It provides convenient typings that can be helpful for using the API.
		 * 
		 * Documentation on GitHub's REST API can be found here: https://docs.github.com/en/rest
		 */
		const octokit = await credentials.getOctokit();
		const userInfo = await octokit.users.getAuthenticated();

		vscode.window.showInformationMessage(`Logged into GitHub as ${userInfo.data.login}`);
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(
		vscode.commands.registerCommand('watermelon.start',async () => {
				let config= await (await gitAPI?.repositories[0]?.getConfig("remote.origin.url"))?.split("/")
				console.log(config)
				if(config){
					repo= config[4].split(".")[0]
					owner = config[3]
				}
				localUser = await gitAPI?.repositories[0]?.getGlobalConfig("user.name")
				console.log("git internal",owner)
				console.log("git internal",repo)
				
				getPRsPerSHAs();
				watermelonPanel.createOrShow(context.extensionUri);
		})
	);
	vscode.window.onDidChangeTextEditorSelection((selection) => {
		startLine = selection.selections[0].start.line;
		endLine = selection.selections[0].end.line;
		getSHAs();
	});


	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(watermelonPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				watermelonPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

}
function escapeFilePath(path:string| undefined){
	if(path){
		// $& means the whole matched string
		return path.replace(/[. *\s+\ ?^${}()|[\]\\]/g, '\\$&');
	}
	else {return "";}
}
function getPRsPerSHAs(){
	octokit.request(`GET /search/issues?type=Commits`, {
		q: `hash:${arrayOfSHAs[0]}`
	}).then(octoresp => {
		const issuesBySHAs = octoresp.data.items;
		issuesBySHAs.forEach((issue: { url: any; }) => {
			const issueUrl = issue.url;

			octokit.request(`GET ${issueUrl}/comments`).then(octoresp => {
				// this paints the panel
				watermelonPanel.currentPanel?.doRefactor({ command: "prs", data: octoresp.data})
				//@ts-ignore
			}).catch(err => {
				console.log("octoerr: ", err);
			});
		})
	}).catch(error=> console.log("octoERR", error))
	// hash:124a9a0ee1d8f1e15e833aff432fbb3b02632105
}

async function getSHAs() {
	const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
	let splitPath = currentlyOpenTabfilePath?.split(path.sep);
	let fileName = splitPath?.pop()?.split(" ").join("\\ ");
	let folderRoute = splitPath?.join(path.sep).split(" ").join("\\ ");
	// Git Blame's index doesn't start at 0 but at 1. But VS Code's API indexes start at 0, despite the IDE showing it starts at 1. 
	// So fucking confusing
	// Therefore we have to add 1 to the index.
	// exec(`cd Users \n cd estebanvargas \n cd wm-extension \n cd src \n git blame -l -L ${startLine+1},${endLine+1} extension.ts`,
	// might return "fatal: no such path '<path>' in HEAD"
	let command = `cd ${folderRoute} |git blame -l -L ${startLine+1},${endLine+1} ${fileName} `
	let toReturn 
	await exec( command, {cwd: folderRoute},
		function (error:string, stdout:string, stderr:string) {
			if (error) {
				// TODO: Prompt the user something here
				 console.log('exec error: ' + error);
			}
			let localSHAs: string[] =[]
			const splitConsoleReturn = stdout.split(EOL);
			splitConsoleReturn.forEach((commit: string) => {
				const commitHash = commit.split(" ")[0].replace("\n", "");
				if (commitHash !== "\n") {
					localSHAs.push(commitHash);
				}
			});
			 toReturn = [...new Set(localSHAs)]

			arrayOfSHAs= toReturn
			return toReturn
		}); 
}

/**
 * Manages cat coding webview panels
 */
class watermelonPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: watermelonPanel | undefined;

	public static readonly viewType = 'watermelon';

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
			'Watermelon',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
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
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor(message:object) {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage(message);
	}

	// public paintPanel (message:object) {
	// 	this._panel.webview.postMessage(message);
	// }

	// arrayOfSHAs: string[]

	public getRepoIssues() {
		let owner = "";
		let repo = "";
		const thisClass = this;
		// get repo name and owner basename
		// NOTE: It's very important to have a piece of code selected for this to work
		exec(`cd ${escapeFilePath(folderRoute)} \n git config --get remote.origin.url`,
			function (error:string, stdout:string, stderr:string) {
				const splitStdout = stdout.split("/");
				let localowner = splitStdout[3];
				owner = localowner
			exec(`cd ${escapeFilePath(folderRoute)} \n git rev-parse --show-toplevel`,
			function (error:string, stdout:string, stderr:string) {
				let localrepo = stdout.split("/")[3];
				repo = localrepo.trim()
				octokit.request(`GET /repos/${owner}/${repo}/issues/comments`).then(octoresp => {
					// this paints the panel
					thisClass._panel.webview.postMessage({ command: "prs", data: octoresp.data})
					//@ts-ignore
				}).catch(err => {
					console.log("octoerr: ", err);
				});
			}
		);
			}
		);
	}
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

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat(webview, 'Watermelon');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat(webview, 'Watermelon');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat(webview, 'Watermelon');
				return;
		}
	}

	private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
		this._panel.title = catName;
		this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
	}

	private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
		// And the uri we use to load this script in the webview
		const scriptUri = (scriptPathOnDisk).with({ 'scheme': 'vscode-resource' });

		// Local path to css styles
		//const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// Uri to load styles into webview
		//const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<header>
				<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"></script>
				<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
				<script src="https://cdn.rawgit.com/oauth-io/oauth-js/c5af4519/dist/oauth.js"></script>
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-social/4.12.0/bootstrap-social.min.css">
			</header>
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>Watermelon</title>
			</head>
			<body>
				<img src="${catGifPath}" width="300" />
				<h1 id="lines-of-code-counter">Github</h1>

				<div id="ghHolder"></div>
				
				<h1 id="lines-of-code-counter">Slack</h1>
				<div id="slackHolder"></div>
				<p>We will soon add Slack search</p>

				<h1 id="lines-of-code-counter">Jira</h1>
				<div id="jiraHolder"></div>
				<p>We will soon add Jira search</p>
				</body>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
	}
}


