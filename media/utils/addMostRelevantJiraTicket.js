const paintTickets = (tickets) => {
  tickets?.forEach((ticket) => {
    if (ticket.key) {
      $("#mostRelevantJiraTicketHolder").append(`
    <div class="Box-header">
      <h5 class="Box-title Truncate">
        ${ticket?.key}
      </h5>
      <span style="color: green">${ticket?.fields?.status?.name}</span>
      <p>${ticket?.fields?.summary}</p>
    </div>
  `);
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
const addMostRelevantJiraTicket = (jiraTickets) => {
  if (Array.isArray(jiraTickets) && jiraTickets.length) {
    let firstTicket = jiraTickets.shift();
    $("#mostRelevantJiraTicketHolder").append(`
    <h3>Most Relevant Jira Ticket</h3>
    `);
    paintTickets([firstTicket]);
    if (jiraTickets.length > 1) {
      addViewAlTicketssButton(jiraTickets);
    }
  }
};

export default addMostRelevantJiraTicket;
