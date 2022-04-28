while (!$) {
  console.log("no $");
}
const vscode = acquireVsCodeApi();

const link = document.getElementsByClassName("help-link");
const button = document.getElementsByClassName("run-watermelon");

let errorTimeout;
function sendMessage(message) {
  vscode.postMessage(message);
}
let authorName = "the code author";
Sentry.init({
  dsn: "https://48cab31c3ca44781a5be625ec226b48a@o1207913.ingest.sentry.io/6341224",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
link[0].addEventListener("click", (event) => {
  sendMessage({ command: "open-link", link: "https://app.slack.com" });
});
button[0].addEventListener("click", (event) => {
  sendMessage({ command: "run" });
});

$(document).ready(function () {
  const replaceIssueLinks = (text, repo_url) => {
    let repoLink = repo_url.replace("api.", "").replace("repos/", "");
    return text
      .replace(
        /#([0-9]*)/gm,
        `<a href="${repoLink}/pull/$1" title="View this issue on github">$&</a>`
      )
      .replaceAll(`&<a href="${repoLink}/pull/39">#39</a>;`, "'");
  };

  const replaceUserTags = (text) => {
    return text
      .replace(
        /\B@([a-z0-9](?:-(?=[a-z0-9])|[a-z0-9]){0,38}(?<=[a-z0-9]))/gi,
        `<a href="https://github.com/$&" title="View this user on github">$&</a>`.toLowerCase()
      )
      .replaceAll("/@", "/");
  };

  const addPRsToDoc = (prs) => {
    $("#ghHolder").append(
      "<button class='run-watermelon'>Run Watermelon</button><br/>"
    );
    $("#ghHolder").append(
      `<button class='help-link'>Get help from ${authorName}</button>`
    );
    $(".run-watermelon").on("click", (event) => {
      sendMessage({ command: "run" });
    });
    prs.forEach((pr, index) => {
      let mdComments = "";
      pr.comments.forEach((comment) => {
        mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author" title="View this user on github">
            <a href="${comment.user.html_url}">${
          comment.user.login
        }</a> on ${new Date(comment.created_at).toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
          </h5>
        </div>
        <div class="comment-body">
      ${replaceUserTags(marked.parse(comment.body))}
        </div>
        </div>`;
      });
      $("#ghHolder").append(`
      <details ${!index ? "open" : ""}>
        <summary><a href="${
          pr.url
        }" target="_blank" title="View this PR on github">${
        pr.title
      }</a></summary>
        <div>
          <div class="pr-owner">
            <p class="pr-poster" title="View this user on github">
              <a class="pr-author-combo" href="${pr.userLink}"><img class='pr-author-img' src="${pr.userImage}" />${pr.user}</a>
            </p>
            <p class="pr-date">
              ${new Date(pr.created_at).toLocaleDateString("en-us", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div class="pr-body">
            ${replaceIssueLinks(
              replaceUserTags(marked.parse(pr.body)),
              pr.repo_url
            )}
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
    $("#ghHolder")
      .append("<button class='run-watermelon'>Run Watermelon</button><br/>")
      .on("click", (event) => {
        sendMessage({ command: "run" });
      });
    $("#ghHolder")
      .append(`<button class='help-link' >Get help from ${authorName}</button>`)
      .on("click", (event) => {
        sendMessage({ command: "open-link", link: "https://app.slack.com" });
      });

    $("#ghHolder").append(
      "<p>Alternatively, you can <a href='https://github.com/watermelontools/wm-extension#commands'>run with our watermelon.start command</a></p>"
    );
    $("#ghHolder").append(
      "<p>Select a piece of code to start. Then run the Watermelon VS Code Command by pressing <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> (or <kbd>CMD</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> in Mac) and type > <code>start watermelon</code></p>"
    );
  }
  function setReceivedError(errorText) {
    clearTimeout(errorTimeout);
    $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We ran into this error: ${errorText}</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
    $("#ghHolder").append(
      "<button class='run-watermelon'>Run Watermelon</button><br/>"
    );
    $(".run-watermelon").on("click", (event) => {
      sendMessage({ command: "run" });
    });
    $("#ghHolder").append(
      `<button class='help-link' >Get help from ${authorName}</button>`
    );
    $(".help-link").on("click", (event) => {
      sendMessage({ command: "open-link", link: "https://app.slack.com" });
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
      case "error":
        setReceivedError(message.error.errorText);
        break;
      case "author":
        authorName = message.author;
        break;
    }
  });
});
