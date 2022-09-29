const addJiraTicketsToDailySummary = (jiraTickets) => {
  $("#dailySummary").append(`<h3>Assigned Jira Tickets</h3>`);
  if (Array.isArray(jiraTickets)) {
    jiraTickets?.forEach((ticket) => {
      $("#dailySummary").append(`
    <div class="Box-header">
        <h5 class="Box-title Truncate">${ticket?.key}</h5>
        <span style="color: red">${ticket?.fields?.status?.name}</span>
        <p>${ticket?.fields?.summary}</p>
    </div>
    <br/>
    `);
    });
  }
};

export default addJiraTicketsToDailySummary;
