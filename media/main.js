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

const button = document.getElementsByClassName("run-watermelon");
const gitBlame = document.getElementsByClassName("git-blame");

let errorTimeout;

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

$(document).ready(function () {
  window.addEventListener("message", (event) => {

    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "user":
        addGHUserInfo(message.data);
        break;
        case "dailySummary":
          console.log("dailySummary");
          console.log(message.data);
        $("#dailySummary").append(`
          <div>
          <h3>Pull Requests To Review:</h3>
          </div>
          <div>
          <h3>Were Reviewed</h3>
          </div>
          <div id="openIssues">
          <h3>Open Issues Assigned to you</h3>
          </div>
        `);
        message.data.issues.map((issue) => {
          $("#openIssues").append(`
          <div>
          <a href="${issue.html_url}">${issue.title}</a>
          </div>
          `);
        });
        
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
  });
});
