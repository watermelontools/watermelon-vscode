import * as vscode from "vscode";

export default function getInitialHTML(
  webview: vscode.Webview,
  stylesMainUri: vscode.Uri,
  codiconsUri: vscode.Uri,
  darkLogo: vscode.Uri,
  lightLogo: vscode.Uri,
  nonce: string,
  scriptUri: vscode.Uri,
  author: string = "the author"
): string {
  let styleSources = [
    "'self'",
    webview.cspSource,
    "sha256-RUgYvsMBjjw/Hs3gLuFfimXhokbGieLHoQliXFrgojQ=",
  ];
  let imageSources = [
    webview.cspSource,
    "https://uploads-ssl.webflow.com/",
    "https://*.githubusercontent.com",
    "https://*.github.com",
    "https://*.github.io",
    "https://cdn.webflow.com/",
    "https://codecov.io/",
    "https://i.imgur.com",
  ];
  let scriptSources = [
    `'nonce-${nonce}'`,
    "https://browser.sentry-cdn.com/",
    "https://cdn.jsdelivr.net/npm/marked/",
    "https://ajax.googleapis.com/ajax/libs/jquery/",
  ];
  let connectSources = [
    "https://*.ingest.sentry.io",
    "https://*.sentry.io",
    "https://*.sentry.dev",
  ];
  let fontSources = ["self", webview.cspSource];
  return `

  <!DOCTYPE html>
  <html lang="en">

      <head>
         <title>Watermelon</title>
         <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*.watermelon.tools;
         style-src ${styleSources.join(" ")};
         img-src ${imageSources.join(" ")};
         script-src ${scriptSources.join(" ")};
         font-src ${fontSources.join(" ")};
         connect-src ${connectSources.join(" ")}">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <meta charset="UTF-8">
        <link href="${stylesMainUri}" rel="stylesheet"/>
        <link href="${codiconsUri}" rel="stylesheet" />
     </head>
     <body data-color-mode="dark" data-light-theme="light" data-dark-theme="dark">
     <div class="Header">
       <div class="Header-item">
        <picture>
          <source
            srcset="${darkLogo}"
            media="(prefers-color-scheme: dark)">
          <img 
          src="${lightLogo}"/>
        </picture>
      </div>
      <details class="dropdown details-reset d-inline-block position-relative">
      <summary class="btn d-flex" aria-haspopup="true">
        <div class="icon-holder">
          <i class="codicon codicon-github replace-user-img anim-pulse"></i>
        </div>
        <div class="icon-holder">
          <i class="codicon codicon-triangle-down"></i>
        </div>
      </summary>
      <div class="Box color-shadow-large position-absolute box-dropdown Box--condensed">
      <div class="Box-body">

        <div class="Box-row login-info">
        </div>
        <div class="Box-row">
        <button class="btn color-bg-sponsors-emphasis color-fg-on-emphasis d-flex width-full flex-row flex-items-center">  
        <div class="icon-holder">
          <i class="codicon codicon-heart"></i>
          </div>
          <span class="btn-text">Sponsor</span>
          </button>
        </div>
        <div class="Box-row Box-row--hover-gray">
         <a href="https://airtable.com/shrVrtfgdtFoITWQN">Newsletter</a>
        </div>
       <div class="Box-row star-us-row">
       <button class="btn color-bg-attention-emphasis color-fg-on-emphasis d-flex width-full flex-row flex-items-center" id="starWMRepo">  
              <div class="icon-holder">
       <i class="codicon codicon-star-full"></i>
       </div>
       <span class="btn-text">Star us</span>
        </button>
      </div>
      <div class="Box-row Box-row--hover-gray">
       <a href="https://github.com/watermelontools/wm-extension/issues">Send an Issue</a>
       </div>
       <div class="Box-row Box-row--hover-gray">
       <a href="https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q">Join us on Slack</a>
     </div>
      </details>
     </div>
        <p>Watermelon helps you get the context of your code.</p>
        <p>Help us by <a href="https://github.com/watermelontools/wm-extension">⭐starring Watermelon on GitHub</a></p>
        <br/>
        <div id="ghHolder">
           <button class='whole-context-button btn btn-primary' type='button'>Get Code Context</button>
           <p>Higlight a piece of code to start.</p>
           <p>We will fetch the commit history for you to understand the context of the code</p>
           <button class='git-blame btn btn-primary' type='button'>View Commit History</button>
           <p>Click this button to enrich your code with relevant information from GitHub:</p>
           <button class='run-watermelon btn btn-primary' type='button'>View Pull Requests</button>
           <p>Alternatively, you can <a href="https://github.com/watermelontools/wm-extension#commands">run with our watermelon.start command</a>, by selecting and right clicking on the selection or by using our <a href="https://github.com/watermelontools/wm-extension#shortcuts"><kbd>keyboard</kbd> shortcuts</a>.</p>
        </div>
        <h2>Daily Summary</h2>
        <div id="dailySummary"></div>
        You will find all your issues and ToDos here. 

     </body>
     <footer>
      <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
      <a href="https://watermelon.tools">Watermelon.tools</a>.
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" 
      async defer fetchpriority="low"
      nonce="${nonce}"
      ></script>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"
      nonce="${nonce}"
      async defer fetchpriority="low"
      ></script>
      <script
      src="https://browser.sentry-cdn.com/6.19.6/bundle.min.js"
      nonce="${nonce}"
      integrity="sha384-XITe7oDiyULCpVPtGc52+ISVyD2MAEbbfpNsmYcfxClZXDw+IA906MSf6rhcdf3L"
      crossorigin="anonymous"
      nonce="${nonce}"
      async defer fetchpriority="low"
      ></script>
     </footer>
     </html>
  `;
}
