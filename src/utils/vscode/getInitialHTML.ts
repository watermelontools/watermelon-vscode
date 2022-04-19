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

      <head>
        <script src="https://cdn.rawgit.com/oauth-io/oauth-js/c5af4519/dist/oauth.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" async defer fetchpriority="low"></script>
        <link rel="stylesheet"
        href="https://unpkg.com/@highlightjs/cdn-assets@11.5.0/styles/default.min.css" async defer fetchpriority="low">
        <script src="https://unpkg.com/@highlightjs/cdn-assets@11.5.0/highlight.min.js" async defer fetchpriority="low"></script>
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
        <script
         src="https://browser.sentry-cdn.com/6.19.6/bundle.min.js"
         integrity="sha384-XITe7oDiyULCpVPtGc52+ISVyD2MAEbbfpNsmYcfxClZXDw+IA906MSf6rhcdf3L"
         crossorigin="anonymous"
         nonce="${nonce}"
         ></script>
     </head>
     <body>
        <img src="${imagePath}" width="300" />
        <p>Watermelon helps you get the context of your code.</p>
        <p>Help us by <a href="https://github.com/watermelontools/wm-extension">starring Watermelon on GitHub</a></p>
        <h1 id="lines-of-code-counter">Github</h1>
        <div id="ghHolder">
           <p>Select a piece of code to start.</p>
           <p>Now, click this button to run:</p>
           <button>Run Watermelon</button>
           <button class='help-link'>Get help on Slack</button>
           <p>We will fetch the associated PRs and comments for you to understand the context of the code</p>
           <p>Alternatively, you can <a href="https://github.com/watermelontools/wm-extension#commands">run with our watermelon.start command</a></p>
        </div>
        <h1 id="lines-of-code-counter">Slack</h1>
        <div id="slackHolder"></div>
        <p>We will soon add Slack search</p>
        <h1 id="lines-of-code-counter">Jira</h1>
        <div id="jiraHolder"></div>
        <p>We will soon add Jira search</p>
        <h2>Need help?</h2>
        <p>Send an issue on <a href="https://github.com/watermelontools/wm-extension/issues">GitHub</a> and join us on <a href="https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q">Slack</a></p>
     </body>
     <footer>
      <script nonce="${nonce}" src="${scriptUri}"></script>
     </footer>
     </html>
  `;
}
