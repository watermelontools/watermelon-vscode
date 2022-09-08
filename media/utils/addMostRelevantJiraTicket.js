const addMostRelevantJiraTicket = (jiraTicket) => {
  $("#jiraHolder").append(`<h3>Most Relevant Jira Ticket</h3>`);
  if (ticket.status === "Done") {
    $("#jiraHolder").append(`
  baristaGeek marked this conversation as resolved.
  Show resolved
          <h3>Assigned Jira Tickets</h3>
              <div class="Box-header">
                <h5 class="Box-title Truncate">
                    ${ticket?.key}
                </h5>
                <span style="color: green">${ticket?.fields.status.name}</span>
                <p>${ticket?.fields.summary}</p>
              </div>
              `);
  } else {
    $("#jiraHolder").append(`
              <div class="Box-header">
                <h5 class="Box-title Truncate">
                  ${ticket?.key}
                </h5>
                <span style="color: red">${ticket.fields.status.name}</span>
                <p>${ticket?.fields.summary}</p>
              </div>
              `);
  }
};

export default addMostRelevantJiraTicket;
