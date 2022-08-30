const addJiraTicketsToDailySummary = () => {
  // Mocked Jira Tickets for testing purposes
  let jiraTickets = [
    {
      key: "JIRA-123",
      summary: "This is a summary of the JIRA ticket",
      url: "https://jira.atlassian.com/browse/JIRA-123",
      assignee: "jiraUser",
      status: "In Progress",
    },
    {
      key: "JIRA-456",
      summary: "This is a summary of the JIRA ticket",
      url: "https://jira.atlassian.com/browse/JIRA-456",
      assignee: "jiraUser",
      status: "Done",
    },
  ];

  // let jiraTickets = fetch('https://app.watermelontools.com/api/jira/getAssignedTicketsInProgress', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //         "email": 'estebanvargas94@gmail.com'
  //     })
  // })
  // .then(response => response.json())
  // .then(data => {
  //     console.log(data);
  //     paintJiraTickets(data);
  // })
  // .catch(error => {
  //     console.log(error);
  // });

  $("#jiraHolder").append(`<h3>Assigned Jira Tickets</h3>`);
  jiraTickets.forEach((ticket) => {
    if (ticket.status === "Done") {
      $("#jiraHolder").append(`
        <h3>Assigned Jira Tickets</h3>
            <div class="Box-header">
                <a href="${ticket.url}" target="_blank" rel="noopener noreferrer">
                    <h5 class="Box-title Truncate">
                        ${ticket.key}
                    </h5>
                </a>
                <span style="color: green">${ticket.status}</span>
                <p>${ticket.summary}</p>
            </div>
            `);
    } else {
      $("#jiraHolder").append(`
            <div class="Box-header">
                <a href="${ticket.url}" target="_blank" rel="noopener noreferrer">
                    <h5 class="Box-title Truncate">
                        ${ticket.key}
                    </h5>
                </a>
                <span style="color: red">${ticket.status}</span>
                <p>${ticket.summary}</p>
            </div>
            `);
    }
  });
};

export default addJiraTicketsToDailySummary;
