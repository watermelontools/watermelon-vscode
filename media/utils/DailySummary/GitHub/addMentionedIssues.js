import issueBox from "./issueBox.js";

function addMentionedIssues(mentionedIssues) {
  if (mentionedIssues.length > 0) {
    $("#mentionedIssues").append(`
    <div class="Box ">
      <div class="Box-header">
        <h3 class="Box-title">Issues that Mention You in this Repo</h3>
      </div>
    </div>
    `);
    mentionedIssues.map((issue) => {
      $("#mentionedIssues .Box").append(`
      ${issueBox(issue)}
      `);
    });
  } else {
    $("#mentionedIssues").append(`
    <div class="Box">
      <div class="blankslate">
        <h3 class="blankslate-heading">No Issues Mention You in this Repo</h3>
        <p>You have no open issues that mention you 🙊</p>
      </div>
    </div>
  `);
  }
}
export default addMentionedIssues;
