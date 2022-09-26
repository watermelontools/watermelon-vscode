const addJiraTicketsToDailySummary = (jiraTickets) => {
  $("#jiraHolder").append(`<h3>Assigned Jira Tickets</h3>`);
  jiraTickets.forEach((ticket) => {
    <div class="Box-header">
      <h5 class="Box-title Truncate">${ticket?.key}</h5>
      <span style="color: red">${ticket?.fields?.status?.name}</span>
      <p>${ticket?.fields?.summary}</p>
    </div>;
  });
};

export default addJiraTicketsToDailySummary;
