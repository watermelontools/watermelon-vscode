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
import addDailySummary from "./utils/addDailySummary.js";

let errorTimeout;

const vscode = acquireVsCodeApi();
window.vscodeApi = vscode;
const oldState = vscode.getState();

if (oldState?.command) {
  handleMessage(oldState);
}
Sentry.init({
  dsn: "https://48cab31c3ca44781a5be625ec226b48a@o1207913.ingest.sentry.io/6341224",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

function handleMessage(message) {
  switch (message.command) {
    case "user":
      addGHUserInfo(message.data);
      break;
    case "dailySummary":
      addDailySummary(message.data);
      break;
    case "prs":
      removeLoading(errorTimeout);
      addPRsToDoc(message.data);
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
    case "removedStar":
      $(".star-us-row").remove();
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
      break;
  }
}

$(document).ready(function () {
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    vscode.setState(message);
    handleMessage(message);
  });
  const button = document.getElementsByClassName("run-watermelon");
  const gitBlame = document.getElementsByClassName("git-blame");
  const starWMRepo = document.getElementById("starWMRepo");
  button[0].addEventListener("click", (event) => {
    sendMessage({ command: "run" });
  });
  gitBlame[0].addEventListener("click", (event) => {
    sendMessage({ command: "blame" });
  });
  starWMRepo.addEventListener("click", (event) => {
    sendMessage({ command: "star" });
  });
});
