import sendMessage from "../../sendVSCodeMessage.js";

const addCommentingSystem = (ticket) => {
    $(`.${ticket.key}`).append(
        `
      <div class="d-flex flex-items-end flex-justify-end" id="jira-comment-button-${ticket.key}">
       <button class="btn" type="button" >Comment</button>
      </div>
      `
      );
      $(`#jira-comment-button-${ticket.key}`).on("click", function (e) {
        $(`#jira-comment-button-${ticket.key}`).replaceWith(`
         <div>
         <span>Comment on ${ticket.key}</span>
          <div>
            <textarea id="jira-comment-${ticket.key}" placeholder="This input supports Markdown"></textarea>
          </div>
          <div class="d-flex flex-items-end flex-justify-end">
           <button class="btn" type="button" id="jira-send-button-${ticket.key}">Send</button>
          </div>
         </div>
         `);
          $(`#jira-send-button-${ticket.key}`).on("click", function (e) {
            sendMessage({
              command: "jiraComment",
              issueIdOrKey: ticket.key,
              text: $(`#jira-comment-${ticket.key}`).val(),
            });
          });
      });
};

export default addCommentingSystem;
