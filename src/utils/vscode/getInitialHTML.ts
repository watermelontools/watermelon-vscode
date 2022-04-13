import * as vscode from "vscode";

export default function getInitialHTML(
  webview: vscode.Webview,
  stylesMainUri: vscode.Uri,
  imagePath: string,
  nonce: string,
  scriptUri: vscode.Uri
): string {
  return `

  <!DOCTYPE html>
  <html lang="en">
     <header>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"></script>
        <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
        <script src="https://cdn.rawgit.com/oauth-io/oauth-js/c5af4519/dist/oauth.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <link rel="stylesheet"
        href="https://unpkg.com/@highlightjs/cdn-assets@11.5.0/styles/default.min.css">
        <script src="https://unpkg.com/@highlightjs/cdn-assets@11.5.0/highlight.min.js"></script>
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
        <img src="${imagePath}" width="300" />
        <p>Watermelon helps you get the context of your code.</p>
        <p>Help us by <a href="https://github.com/watermelontools/wm-extension">starring Watermelon on GitHub</a></p>
        <div id="ghHolder">
           <p>Higlight a piece of code to start.</p>
           <p>Click this button to enrich your code with relevant information from GitHub:</p>
           <button id="startButton">Run Watermelon</button>
           <p>Click this button to send a Slack message to the owner of the highlighted block of code:</p>
           <button id="slackButton">Send Slack Message</button>
           <p>Alternatively, you can <a href="https://github.com/watermelontools/wm-extension#commands">run with our watermelon.start command</a></p>
        </div>
        <h2>Need help?</h2>
        <p>Send an issue on <a href="https://github.com/watermelontools/wm-extension/issues">GitHub</a> and join us on <a href="https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q">Slack</a></p>
     </body>
     <script nonce="${nonce}" src="${scriptUri}"></script>
  </html>
  `;
}
