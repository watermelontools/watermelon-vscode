import dateToHumanReadable from "../../dateToHumanReadable.js";
const addJiraTicketsToDailySummary = (jiraTickets) => {
  $("#dailySummary").append(`<h3>Assigned Jira Tickets</h3>`);
  if (Array.isArray(jiraTickets)) {
    jiraTickets?.forEach((ticket) => {
      console.log(ticket);
      $("#dailySummary").append(`
      <div class="Box ${ticket.key}">
      <div class="Box-header d-flex flex-justify-between">
      <a href="${ticket.fields.priority.iconUrl.split("/images")[0]}/browse/${
        ticket?.key
      }">
        <h5 class="Box-title Truncate">
         ${ticket?.key}: ${ticket?.fields?.summary}
       </h5>
      </a>
      <span style="color: green">${ticket?.fields?.status?.name}</span>
    </div>
    ${
      ticket?.renderedFields?.description
        ? `<div class="Box-body">${ticket?.renderedFields?.description}</div>`
        : "<em> No description provided. </em>"
    }
    </div>
    <br/>
    `);
      if (Array.isArray(ticket?.comments)) {
        {
          ticket?.comments?.forEach((comment) => {
            $(`.${ticket.key}`).append(`
    <div class="Box">
      <div class="Box-header d-flex">
      <p class="pr-poster">
        <img class='pr-author-img' src="${
          comment?.updateAuthor?.avatarUrls["48x48"]
        }" />
        ${comment?.updateAuthor?.displayName}
      </p>
      <p class="pr-date">
          on ${dateToHumanReadable(comment?.updated)}
      </p>
      </div>
      <div class="Box-body">
      ${comment.renderedBody}
      </div>
    </div>
    `);
          });
        }
      }
    });
  }
};

export default addJiraTicketsToDailySummary;
