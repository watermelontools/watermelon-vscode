import issueBox from "./issueBox.js";

function addCreatorIssues(creatorIssues) {
  if (creatorIssues.length > 0) {
    $("#creatorIssues").append(`
          <div class="Box ">
            <div class="Box-header">
              <h3 class="Box-title">Issues Created by You in this Repo</h3>
            </div>
          </div>
          `);
    creatorIssues.map((issue) => {
      $("#creatorIssues .Box").append(`
            ${issueBox(issue)}
            `);
    });
  } else {
    $("#creatorIssues").append(`
        <div class="Box">
          <div class="blankslate">
            <h3 class="blankslate-heading">You have not Created Issues in this Repo</h3>
            <p>Go ahead and do so 🌵</p>
          </div>
        </div>
        `);
  }
}
export default addCreatorIssues;
