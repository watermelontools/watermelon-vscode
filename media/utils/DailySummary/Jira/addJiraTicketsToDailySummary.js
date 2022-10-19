const addJiraTicketsToDailySummary = (jiraTickets) => {
  $("#dailySummary").append(`<h3>Assigned Jira Tickets</h3>`);
  if (Array.isArray(jiraTickets)) {
    jiraTickets?.forEach((ticket) => {
      $("#dailySummary").append(`
<<<<<<< Updated upstream
    <div class="Box-header">
        <h5 class="Box-title Truncate">${ticket?.key}</h5>
        <span style="color: red">${ticket?.fields?.status?.name}</span>
        <p>${ticket?.fields?.summary}</p>
=======
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
      ticket?.renderedFields?.description ? (
        <div class="Box-body">${ticket?.renderedFields?.description}</div>
      ) : (
        ""
      )
    }
>>>>>>> Stashed changes
    </div>
    <br/>
    `);
    });
  }
};

export default addJiraTicketsToDailySummary;
