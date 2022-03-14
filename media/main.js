const prJson = {
  title: "Summary",
};

while (!$) {
  console.log("no $");
}
$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    removeLoading();
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
