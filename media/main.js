const prJson = {
  title: "activesupport `Object#as_json` more thorough implicit conversion",
};

while (!$) {
  console.log("no $");
}
$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    $("#ghHolder").append(`
    <details open>
      <summary>${prJson.title}</summary>
      <div id="ghInternal"></div>
    </details>`);
    prs.forEach((pr) => {
      $("#ghInternal").append(`
        <div>
          <div class="comment-owner">
            <p class="comment-poster">${pr.user.login}</p>
            <p class="comment-date">${pr.updated_at}</p>
          </div>
          <p class="comment-body">${pr.body}</p>
        </div>
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
