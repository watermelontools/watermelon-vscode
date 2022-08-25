const paintJiraTickets = (jiraTickets) => {
    $("#jiraHolder").append(jiraTickets);
};

const addJiraTicketsToDailySummary = () => {
    $("#jiraHolder").append(`
        <h3>Pending Jira Tickets</h3>
    `);

    let jiraTickets = fetch('https://app.watermelontools.com/api/jira/getAssignedTicketsInProgress')
        .then(response => response.json())
        .then(data => {
            // get the tickets from the response
            return data.tickets;
        });

    paintJiraTickets(jiraTickets);
  };
  
  export default addJiraTicketsToDailySummary;
  