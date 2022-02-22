import * as vscode from 'vscode';
import { Octokit } from "@octokit/core";
import { GitExtension } from '../git';
import { Credentials } from './credentials';

//@ts-ignore
//console.log(git?.getRepository(vscode.Uri.file(vscode.workspace?.workspaceFolders[0].uri.path)))
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const cats = {
	'Watermelon': 'https://uploads-ssl.webflow.com/61481c822e33bdb0fc03b217/614825b4a1420225f943ffc1_IMAGOTIPO%20FINAL%201-8.png',
};
let owner = process.env.GH_OWNER || "facebook";
let repo = process.env.GH_REPO || "react";
export async function activate(context: vscode.ExtensionContext) {
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
		vscode.commands.registerCommand('watermelon.start', () => {
			watermelonPanel.createOrShow(context.extensionUri);
		})
	);
	vscode.window.onDidChangeTextEditorSelection((selection) => {
		vscode.window.showInformationMessage(
			`${selection.textEditor.document.getText(new vscode.Range(selection.selections[0].start, selection.selections[0].end))}`
		);
	})


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

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
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
		this.getRepoIssues();

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

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}
	public getRepoIssues() {
		octokit.request('GET /repos/{owner}/{repo}/issues/comments', {
			// for now, let's use envvars
			owner: owner,
			repo: repo,
			/* owner: 'octocat', // should be local (from token)
			repo: 'hello-world' // should be local (from reponame?) */
			// or parse git remote show originº
		}).then(octoresp => {
			console.log(octoresp);
			this._panel.webview.postMessage({ command: "prs", data: octoresp.data })
		});
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

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')
let git
console.log("gitEXTPRE", gitExtension?.isActive)
gitExtension?.activate()
console.log("gitEXT", gitExtension?.isActive)

if (gitExtension?.isActive) {
	git = gitExtension?.exports?.getAPI(1)
	console.log("ACTIVEgit", git)
};
