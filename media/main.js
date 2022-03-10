const prJson = {
  title: "Summary",
};

while (!$) {
  console.log("no $");
}
$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    console.log("prs: ", prs)
    // $("#ghHolder").append(`
    // <details open>
    //   <summary>${pr.issue_url.title || "PR Summary"}</>
    //   <div id="ghInternal"></div>
    // </details>`);
    prs.forEach((pr) => {
      $("#ghInternal").append(`
        <details open>
          <div>
          <details open>
          <summary>${pr.issue_url.title || "PR Summary"}</>
          <div id="ghInternal"></div>
        </details>
            <div class="comment-owner">
              <p class="comment-poster">Author: ${pr.user.login}</p>
              <p class="comment-date">${new Date(pr.updated_at)}</p>
            </div>
            <p class="comment-body">${pr.body}</p>
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
