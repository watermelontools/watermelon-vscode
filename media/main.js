const prJson = {
  title: "Summary",
};

while (!$) {
  console.log("no $");
}

function parseMarkdown(markdownText) {
	const htmlText = markdownText
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
		.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
		.replace(/\*(.*)\*/gim, '<i>$1</i>')
		.replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
		.replace(/\n$/gim, '<br />')

	return htmlText.trim()
}

$(document).ready(function () {
  const addPRsToDoc = (prs) => {
    console.log("prs: ", prs)
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
          <div class="markdown-wrapper">
            <div class="markdown-text">
              <p class="comment-body">${parseMarkdown(pr.body)}</p>
            </div>
          </div>
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