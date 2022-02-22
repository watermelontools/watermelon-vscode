import * as vscode from 'vscode';
import { Credentials } from './credentials';

//TODO: create a wmPanel type that extends vscode.WebviewPanel
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
}

export async function activate(context: vscode.ExtensionContext, watermelonPanel: any) {
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