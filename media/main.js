while (!$) {
  console.log("no $");
}
import setReceivedError from "./utils/setReceivedError.js";
import setLoading from "./utils/setLoading.js";
import removeLoading from "./utils/removeLoading.js";
import clampCodeBlocks from "./utils/clampCodeBlocks.js";
import addPRsToDoc from "./utils/addPRsToDoc.js";
import sendMessage from "./utils/sendVSCodeMessage.js";
import addBlametoDoc from "./utils/addBlametoDoc.js";
import addGHUserInfo from "./utils/addGHUserInfo.js";
import addVersionToFooter from "./utils/addVersionToFooter.js";
import addSessionToFooter from "./utils/addSessionToFooter.js";

let errorTimeout;

const vscode = acquireVsCodeApi();
window.vscodeApi = vscode;
const oldState = vscode.getState();

if (oldState?.command) {
  handleMessage(oldState);
}
const button = document.getElementsByClassName("run-watermelon");
const gitBlame = document.getElementsByClassName("git-blame");

Sentry.init({
  dsn: "https://48cab31c3ca44781a5be625ec226b48a@o1207913.ingest.sentry.io/6341224",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
button[0].addEventListener("click", (event) => {
  sendMessage({ command: "run" });
});
gitBlame[0].addEventListener("click", (event) => {
  sendMessage({ command: "blame" });
});

function handleMessage(message) {
  switch (message.command) {
    case "user":
      addGHUserInfo(message.data);
      break;
    case "dailySummary":
      $("#dailySummary").append(`
      <div id="assignedIssues">
      <h3>Issues Assigned to You in this Repo</h3>
      </div>
      <div id="creatorIssues">
      <h3>Issues You Created in this Repo</h3>
      </div>
      <div id="mentionedIssues">
      <h3>Issues that Mentioned You in this Repo</h3>
      </div>
        <div id="globalIssues">
        <h3>Open Issues Assigned to You in All of GitHub</h3>
        </div>
      `);
      if (message.data.globalIssues.length > 0) {
        message.data.globalIssues.map((issue) => {
          $("#globalIssues").append(`
        <div>
        <a href="${issue.html_url}">${issue.title}</a>
        </div>
        `);
        });
      } else {
        $("#globalIssues").append(`
      <div>
      <p>You have no open issues assigned to you</p>
      </div>
      `);
      }
      if (message.data.assignedIssues.length > 0) {
        message.data.assignedIssues.map((issue) => {
          $("#assignedIssues").append(`
  <div>
  <a href="${issue.html_url}">${issue.title}</a>
  </div>
  `);
        });
      } else {
        $("#assignedIssues").append(`
<div>
<p>You have no open issues assigned to you 🧘</p>
</div>
`);
      }
      if (message.data.creatorIssues.length > 0) {
        message.data.creatorIssues.map((issue) => {
          $("#creatorIssues").append(`
  <div>
  <a href="${issue.html_url}">${issue.title}</a>
  </div>
  `);
        });
      } else {
        $("#creatorIssues").append(`
<div>
<p>You have no open issues created 🌵</p>
</div>
`);
      }
      if (message.data.mentionedIssues.length > 0) {
        message.data.mentionedIssues.map((issue) => {
          $("#mentionedIssues").append(`
  <div>
  <a href="${issue.html_url}">${issue.title}</a>
  </div>
  `);
        });
      } else {
        $("#mentionedIssues").append(`
<div>
<p>You have no open issues that mention you 🙊</p>
</div>
`);
      }

      break;
    case "prs":
      removeLoading(errorTimeout);
      addPRsToDoc(message.data);
      hljs.highlightAll();
      clampCodeBlocks();
      break;
    case "loading":
      errorTimeout = setLoading(errorTimeout);
      break;
    case "error":
      errorTimeout = setReceivedError(message.error.errorText, errorTimeout);
      break;
    case "versionInfo":
      addVersionToFooter(message.data);
      break;
    case "author":
      authorName = message.author;
      break;
    case "session":
      addSessionToFooter(message.data);
      break;
    case "blame":
      let commitLink = undefined;
      if (message.owner && message.repo) {
        commitLink = `https://github.com/${message.owner}/${message.repo}/commit/`;
      }
      removeLoading(errorTimeout);
      addBlametoDoc(message.data, commitLink);
      break;
    default:
      console.log("Unknown command");
      console.log(message);
  }
}

$(document).ready(function () {
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    vscode.setState(message);
    handleMessage(message);
  });
});
