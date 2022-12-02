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
import addMostRelevantJiraTickets from "./utils/addMostRelevantJiraTickets.js";
import sendLinkToOpen from "./utils/sendLinkToOpen.js";

let errorTimeout;

const vscode = acquireVsCodeApi();
window.vscodeApi = vscode;
const oldState = vscode.getState();
let ghUserInfo = {};

if (oldState?.command && oldState.command !== "loading") {
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
      ghUserInfo = message.user;
      addGHUserInfo(message.data);
      break;
    case "dailySummary":
      webviewDebugLogger(
        `Received dailySummary: ${JSON.stringify(message.data)}`
      );
      addDailySummary({
        gitHubIssues: message.data.gitHubIssues,
        jiraTickets: message.data.jiraTickets,
      });
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
      // blame table
      addBlametoDoc(message.data.uniqueBlames, commitLink);
      // prs
      webviewDebugLogger(`Received prs: ${JSON.stringify(message.data)}`);
      addPRsToDoc(message.data.sortedPRs);
      // jira
      if (message.data?.mostRelevantJiraTickets) {
        $("#mostRelevantJiraTicketHolder").empty();
        addMostRelevantJiraTickets(message.data.mostRelevantJiraTickets);
      }
      clampCodeBlocks();
      break;
    case "error":
      webviewDebugLogger(`Received error: ${JSON.stringify(message.data)}`);
      clearTimeout(errorTimeout);
      setReceivedError(message.error.errorText);
      break;
    case "versionInfo":
      webviewDebugLogger(
        `Received versionInfo: ${JSON.stringify(message.data)}`
      );
      addVersionToFooter(message.data);
      break;
    case "removedStar":
      $(".star-us-row").remove();
      break;
    case "session":
      webviewDebugLogger(`Received session: ${JSON.stringify(message.data)}`);
      addSessionToFooter(message.data);
      break;
    case "loading":
      vscode.setState({ command: "loading" });
      $("#ghHolder").empty();
      $("#ghHolder").append(`<p class="anim-pulse">Loading...</p>`);
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
  $("body")
    .find("a")
    .each(function (element) {
       $(this).on("click", function (e) {
        e.preventDefault();
        let link = $(this).attr("href");
        sendLinkToOpen({ link, source: "dailySummary" });
      }); 
    });
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
    sendMessage({ command: "star", email: ghUserInfo.email });
  });
  $("body")
    .find("a")
    .each(function (element) {
      $(this).on("click", function (e) {
        e.preventDefault();
        let link = $(this).attr("href");
        sendLinkToOpen({ link });
      }); 
    });
});
