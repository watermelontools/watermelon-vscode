while (!$) {
  console.log("no $");
}
const vscode = acquireVsCodeApi();

const button = document.querySelector("button");
const link = document.getElementsByClassName("help-link");

let errorTimeout;
function sendMessage(message) {
  vscode.postMessage(message);
}

$('#slackhelp').click(function(){ fetch("http://localhost:3001/api/analytics/slack/slackhelp"); return false; });

Sentry.init({
  dsn: "https://48cab31c3ca44781a5be625ec226b48a@o1207913.ingest.sentry.io/6341224",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

button.addEventListener("click", (event) => {
  sendMessage({ command: "run" });
});

link[0].addEventListener("click", (event) => {
  sendMessage({ command: "open-link", link: "https://app.slack.com" });
});
$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    $("#ghHolder").append("<button>Run Watermelon</button><br/>");
    $("#ghHolder").append(
      "<button class='help-link'>Get help on Slack</button>"
    );
    $("button").on("click", (event) => {
      sendMessage({ command: "run" });
    });
    prs.forEach((pr, index) => {
      let mdComments = "";
      pr.comments.forEach((comment) => {
        mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author">
          <a href=${comment.user.html_url}>${comment.user.login}</a> on ${new Date(comment.created_at)}
          </h5>
        </div>
        <div class="comment-body">
      ${marked.parse(comment.body)}
        </div>
        </div>`;
      });
      $("#ghHolder").append(`
      <details ${!index ? "open" : ""}>
        <summary><a href="${pr.url}" target="_blank">${pr.title}</a></summary>
        <div>
          <div class="pr-owner">
            <p class="pr-poster">
              Author: ${pr.user}
            </p>
            <p class="pr-date">
              ${new Date(pr.created_at)}
            </p>
          </div>
          <div class="pr-body">
            ${marked.parse(pr.body)}
          </div>
          ${mdComments}
        </div>
      </details>
      `);
    });
    hljs.highlightAll();
    $("code").each(function (index, element) {
      // replace each with the clamped version and a see more button
      if ($(this).text().length > 100) {
        $(this).addClass("clamp");
        $(this).append("<button class='see-more'>See More</button>");
      }
      // now restore the text when the button was clicked
      $(this).on("click", ".see-more", function () {
        $(this).parent().removeClass("clamp");
        $(this).remove();
      });
    });
  };
  function setLoading() {
    $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>Loading...</p>
    </div>
    `);
    errorTimeout = setTimeout(setError, 4000);
  }
  function setError() {
    $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We might have run into an error, our team is on it.</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
    $("#ghHolder").append("<button>Run Watermelon</button>");
    $("#ghHolder").append(
      "<button class='help-link' >Get help on Slack</button>"
    );

    $("button").on("click", (event) => {
      sendMessage({ command: "run" });
    });
  }
  function removeLoading() {
    clearTimeout(errorTimeout);
    $("#ghHolder p").remove();
    $("#ghHolder button").remove();
  }

  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "prs":
        removeLoading();
        addPRsToDoc(message.data);
        break;
      case "loading":
        setLoading();
        break;
    }
  });
});
