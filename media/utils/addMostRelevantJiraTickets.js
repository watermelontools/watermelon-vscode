import dateToHumanReadable from "./dateToHumanReadable.js";
const paintTickets = (tickets) => {
  tickets?.forEach((ticket) => {
    if (ticket.key) {
      $("#mostRelevantJiraTicketHolder").append(`
      <div class="Box">
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
        : ""
    }
    </div>
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
    }
  });
};
const addViewAlTicketssButton = (allJiraTickets) => {
  $("#mostRelevantJiraTicketHolder").append(`
    <div class="anim-fade-in">
      <button class="btn btn-primary btn-sm" id="viewAllPRs">View More Tickets</button>
    </div>
  `);
  $("#viewAllPRs").on("click", (event) => {
    paintTickets(allJiraTickets);
    $("#viewAllPRs").remove();
  });
};
const addMostRelevantJiraTickets = (jiraTickets) => {
  if (Array.isArray(jiraTickets) && jiraTickets.length) {
    let firstTicket = jiraTickets.shift();
    $("#mostRelevantJiraTicketHolder").append(`
    <h3>Most Relevant Jira Ticket</h3>
    `);
    paintTickets([firstTicket]);
    if (jiraTickets.length > 1) {
      addViewAlTicketssButton(jiraTickets);
    }
  } else {
    $("#mostRelevantJiraTicketHolder").append(
      `<p><a href="https://www.watermelontools.com/pages/pricing">Click here</a> to integrate Jira to your code archeology toolbox!</p>`
    );
  }
};

export default addMostRelevantJiraTickets;
