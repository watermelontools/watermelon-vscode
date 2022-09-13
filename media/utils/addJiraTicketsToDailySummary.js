const addJiraTicketsToDailySummary = (jiraTickets) => {
  $("#jiraHolder").append(`<h3>Assigned Jira Tickets</h3>`);
  jiraTickets.forEach((ticket) => {
    if (ticket.status === "Done") {
      $("#jiraHolder").append(`
        <h3>Assigned Jira Tickets</h3>
            <div class="Box-header">
              <h5 class="Box-title Truncate">
                  ${ticket?.key}
              </h5>
              <span style="color: green">${ticket?.fields?.status?.name}</span>
              <p>${ticket?.fields?.summary}</p>
            </div>
            `);
    } else {
      $("#jiraHolder").append(`
            <div class="Box-header">
              <h5 class="Box-title Truncate">
                ${ticket?.key}
              </h5>
              <span style="color: red">${ticket?.fields?.status?.name}</span>
              <p>${ticket?.fields?.summary}</p>
            </div>
            `);
    }
  });
};

export default addJiraTicketsToDailySummary;
