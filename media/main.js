const prJson = {
  title: "Summary",
};

while (!$) {
  console.log("no $");
}

function parseMarkdown(markdownText) {
  const htmlText = markdownText
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*)\*/gim, "<i>$1</i>")
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, "<br />");

  return htmlText.trim();
}

$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    removeLoading();
    prs.forEach((pr) => {
      let mdComments = pr.comments.map((comment) => parseMarkdown(comment));
      $("#ghHolder").append(`
      <details open>
        <summary>${pr.title}</summary>
        <div id="ghInternal">
          <div class="comment-owner">
            <p class="comment-poster">Author: ${pr.user}</p>
            <p class="comment-date">${new Date(pr.created_at)}</p>
          </div>
          <a href="${pr.url}" target="_blank">${pr.url}</a>
          <p class="comment-body">${mdComments}</p>
        </div>
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
