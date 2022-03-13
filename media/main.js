while (!$) {
  console.log("no $");
}
$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    prs.forEach((pr) => {
      $("#ghHolder").append(`
      <details open>
        <summary>${pr.title}</summary>
        <div id="ghInternal">
          <div class="comment-owner">
            <p class="comment-poster">Author: ${pr.user}</p>
            <p class="comment-date">${new Date(pr.created_at)}</p>
          </div>
          <p class="comment-body">${pr.comments}</p>
        </div>
        </div>
      </details>
      `);
    });
  };
  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case "prs":
        addPRsToDoc(message.data);
        break;
    }
  });
});
