while (!$) {
  console.log("no $");
}
import replaceIssueLinks from "./utils/replaceIssueLinks.js";
import replaceUserTags from "./utils/replaceUserTags.js";
import dateToHumanReadable from "./utils/dateToHumanReadable.js";
import setReceivedError from "./utils/setReceivedError.js";
import setLoading from "./utils/setLoading.js";
import removeLoading from "./utils/removeLoading.js";
import clampCodeBlocks from "./utils/clampCodeBlocks.js";
const vscode = acquireVsCodeApi();

const link = document.getElementsByClassName("create-docs");
const button = document.getElementsByClassName("run-watermelon");

let errorTimeout;
function sendMessage(message) {
  vscode.postMessage(message);
}
Sentry.init({
  dsn: "https://48cab31c3ca44781a5be625ec226b48a@o1207913.ingest.sentry.io/6341224",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
link[0].addEventListener("click", (event) => {
  sendMessage({ command: "create-docs" });
});
button[0].addEventListener("click", (event) => {
  sendMessage({ command: "run" });
});

$(document).ready(function () {
  const addPRsToDoc = (prs, codex) => {
    $("#ghHolder").append(
      "<button class='run-watermelon'>Run Watermelon</button><br/>"
    );

    $("#ghHolder").append(
      `<button class='create-docs'>Create repo docs</button>`
    );
    $(".run-watermelon").on("click", (event) => {
      sendMessage({ command: "run" });
    });
    $(".create-docs").on("click", (event) => {
      sendMessage({ command: "create-docs" });
    });
    $("#ghHolder").append(`<p>${codex}</p>`);
    prs.forEach((pr, index) => {
      let mdComments = "";
      pr.comments.forEach((comment) => {
        mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author" title="View this user on github">
            <a href="${comment.user.html_url}">${
          comment.user.login
        }</a> on ${dateToHumanReadable(comment.created_at)}
          </h5>
        </div>
        <div class="comment-body">
      ${comment?.body ? replaceUserTags(marked.parse(comment.body)) : ""}
        </div>
        </div>`;
      });
      $("#ghHolder").append(`
      <details ${!index ? "open" : ""}>
        <summary class="pr-title">
        <img class="pr-state" src="${
          pr.state === "closed"
            ? "https://raw.githubusercontent.com/primer/octicons/main/icons/git-merge-24.svg"
            : "https://raw.githubusercontent.com/primer/octicons/main/icons/git-pull-request-24.svg"
        }"
        />
        <a 
       href="${pr.url}" target="_blank" title="View this PR on github">${
        pr.title
      }
      </a>
      </summary>
        <div>
        <div class="pr-header">
          <div class="pr-owner">
            <p class="pr-poster" title="View this user on github">
              <a class="pr-author-combo" href="${
                pr.userLink
              }"><img class='pr-author-img' src="${pr.userImage}" />${
        pr.user
      }</a>
            </p>
            <p class="pr-date">
              ${dateToHumanReadable(pr.created_at)}
            </p>
          </div>
        </div>
          <div class="pr-body">
            ${
              pr?.body
                ? replaceIssueLinks(
                    replaceUserTags(marked.parse(pr.body)),
                    pr.repo_url
                  )
                : ""
            }
          </div>
          ${mdComments}
        </div>
      </details>
      `);
    });
    hljs.highlightAll();
clampCodeBlocks();
  };

  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "prs":
        removeLoading(errorTimeout);
        addPRsToDoc(message.data, event.data.explanation);
        break;
      case "loading":
        setLoading();
        break;
      case "error":
        setReceivedError(message.error.errorText, errorTimeout);
        break;
      case "author":
        authorName = message.author;
        break;
    }
  });
});
