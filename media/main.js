while (!$) {
  console.log("no $");
}
const vscode = acquireVsCodeApi();

const button = document.querySelector("button");

function sendMessage(message) {
  vscode.postMessage(message);
}

button.addEventListener("click", (event) => {
  sendMessage({ command: "run" });
});

$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    removeLoading();
    prs.forEach((pr, index) => {
      let mdComments = "";
      pr.comments.forEach((comment) => {
        mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author">
          ${comment.user.login} on ${new Date(comment.created_at)}
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
  };
  const setLoading = () => {
    $("#ghHolder").append(`
    <p>Loading...</p>
    `);
  };
  const removeLoading = () => {
    $("#ghHolder p").remove();
  };
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "prs":
        addPRsToDoc(message.data);
        break;
      case "loading":
        setLoading();
        break;
    }
  });
});
