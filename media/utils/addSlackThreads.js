import sendMessage from "./sendVSCodeMessage.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import parseComments from "./parseComments.js";
import addCommentingSystem from "./DailySummary/GitHub/addCommentingSystem.js";

const paintPRs = (threads) => {
  threads.forEach((thread, index) => {
    $("#slackHolder").append(`
    <div class="anim-fade-in">
      <details ${!index ? "open" : ""} class="gh-issue-${thread.channel.id}">
        <summary class="pr-title">
          <div>
            <div class="details-state">
              <div class="icon-holder">
                <i class='codicon codicon-chevron-right'></i>
                <i class='codicon codicon-chevron-down'></i>
              </div>
              <a 
              href="${thread.permalink}" target="_blank" title="View this PR on github">#${
      thread.channel.name
    }</a>
            </div>
          </div>
      </summary>
        <div class="Box">
        <div class="Box-header d-flex">
            <p class="pr-poster">
            ${thread.username}
            </p>
            <p class="pr-date">
                on ${dateToHumanReadable(new Date(thread.ts))}
            </p>
        </div>
          <div class="Box-body">
            ${
                marked.parse(thread?.text)
            }
          </div>
        </div>
      </details>
    </div>
      `);
    /* addCommentingSystem(thread.number); */
  });
};
const addviewAllThreadsButton = (allPRs) => {
  $("#slackHolder").append(`
    <div class="anim-fade-in">
      <button class="btn btn-primary btn-sm" id="viewAllThreads">View threads</button>
    </div>
  `);
  $("#viewAllThreads").on("click", (event) => {
    paintPRs(allPRs);
    $("#viewAllThreads").remove();
  });
};

const addSlackThreads = (allThreads) => {
  $("#slackHolder").empty();
  $("#slackHolder").append(`
  <h3>Slack Threads</h3>
  `);
  if (allThreads.error) {
    $("#slackHolder").append(`
    <p>You are not logged in to Slack</p>
    <button class="login-watermelon btn" type="button">Login to Slack</button>
    `);

    $(".login-watermelon").on("click", (event) => {
      sendMessage({ command: "login" });
    });
    return;
  }
  let firstThread = allThreads.shift();
  paintPRs([firstThread]);
  if (allThreads.length > 0) {
    addviewAllThreadsButton(allThreads);
  }
};

export default addSlackThreads;
