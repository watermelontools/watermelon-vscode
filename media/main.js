while (!$) {
  console.log("no $");
}
import setReceivedError from "./utils/setReceivedError.js";
import removeLoading from "./utils/removeLoading.js";
import clampCodeBlocks from "./utils/clampCodeBlocks.js";
import addPRsToDoc from "./utils/addPRsToDoc.js";
import sendMessage from "./utils/sendVSCodeMessage.js";
import addBlametoDoc from "./utils/addBlametoDoc.js";
import addGHUserInfo from "./utils/addGHUserInfo.js";
import addVersionToFooter from "./utils/addVersionToFooter.js";
import addSessionToFooter from "./utils/addSessionToFooter.js";
import addDailySummary from "./utils/addDailySummary.js";
import webviewDebugLogger from "./utils/webviewDebugLogger.js";
import addActionButtons from "./utils/addActionButtons.js";

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
  webviewDebugLogger(message.command);
  switch (message.command) {
    case "user":
      webviewDebugLogger(`Received user: ${JSON.stringify(message.user)}`);
      addGHUserInfo(message.data);
      break;
    case "dailySummary":
      webviewDebugLogger(
        `Received dailySummary: ${JSON.stringify(message.data)}`
      );
      addDailySummary(message.data);
      break;
    case "prs":
      webviewDebugLogger(message.data);
      removeLoading(errorTimeout);
      // action buttons
      addActionButtons();
      // blame
      webviewDebugLogger(`Received blame: ${JSON.stringify(message.data)}`);
      let commitLink = undefined;
      if (message.owner && message.repo) {
        commitLink = `https://github.com/${message.owner}/${message.repo}/commit/`;
      }
      addBlametoDoc(message.data.uniqueBlames, commitLink);
      // prs
      webviewDebugLogger(`Received prs: ${JSON.stringify(message.data)}`);
      addPRsToDoc(message.data.sortedPRs);
      clampCodeBlocks();
      break;
    case "error":
      webviewDebugLogger(`Received error: ${JSON.stringify(message.data)}`);
      errorTimeout = setReceivedError(message.error.errorText, errorTimeout);
      break;
    case "versionInfo":
      webviewDebugLogger(
        `Received versionInfo: ${JSON.stringify(message.data)}`
      );
      addVersionToFooter(message.data);
      break;
    case "author":
      webviewDebugLogger(`Received author: ${JSON.stringify(message.data)}`);
      authorName = message.author;
      break;
    case "removedStar":
      $(".star-us-row").remove();
      break;
    case "session":
      webviewDebugLogger(`Received session: ${JSON.stringify(message.data)}`);
      addSessionToFooter(message.data);
      break;
    case "talkToCTO":
      $(".action-buttons").append(
        `<p>Wanna give us feedback? <a href="https://cal.pv.dev/esteban-dalel-watermelon-tools/half-hour-chat">Talk to the CTO</a></p>`
      );

      break;
    default:
      webviewDebugLogger(
        `Received unknown command: ${JSON.stringify(message)}`
      );
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
  const starWMRepo = document.getElementById("starWMRepo");
  button[0].addEventListener("click", (event) => {
    sendMessage({ command: "run" });
  });
  starWMRepo.addEventListener("click", (event) => {
    sendMessage({ command: "star" });
  });
});
