import addActionButtons from "./addActionButtons.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import sendMessage from "./sendVSCodeMessage.js";

const addBlametoDoc = (blameArray, commitLink) => {
  console.log(blameArray);
  addActionButtons();
  $("#ghHolder").append(`
    <h3>Commits</h3>
    `);
  $("#ghHolder").append(`
    <table class="blame-table">
      <thead>
        <tr>
          <th>Commit</th>
          <th>Author</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody class="blame-rows">
      </tbody>
    </table>
    `);
  blameArray.forEach((blameLine, index) => {
    $(".blame-rows").append(`
      <tr ${index % 2 === 0 ? 'class="table-zebra"' : ""}>
        <td>
        ${
          commmitLink
            ? `<a href='${commitLink}${blameLine?.hash}'>
              ${blameLine?.hash?.slice(0, 7)}
              </a>`
            : blameLine?.hash?.slice(0, 7)
        }
        </td>
        <td>${blameLine.authorName}</td>
        <td>${blameLine.message}</td>
        <td>${dateToHumanReadable(blameLine.commitDate)}</td>
      </tr>
      `);
  });
};

export default addBlametoDoc;
