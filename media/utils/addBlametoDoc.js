import dateToHumanReadable from "./dateToHumanReadable.js";
import sendMessage from "./sendVSCodeMessage.js";

const addBlametoDoc = (blameArray) => {
  console.log(blameArray);
  $("#ghHolder").append(
    `<button class='create-docs'>Create Repo Docs</button><br/>`
  );
  $("#ghHolder").append(
    `<button class='git-blame'>View Git Blame</button>`
  );
  $("#ghHolder").append(
    "<button class='run-watermelon'>View Pull Requests (Beta)</button><br/>"
  );
  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
  $(".create-docs").on("click", (event) => {
    sendMessage({ command: "create-docs" });
  });
  $(".git-blame").on("click", (event) => {
    sendMessage({ command: "blame" });
  });
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
      <tr ${index%2===0? 'class="table-zebra"':""}>
        <td>${blameLine?.hash?.slice(0,7)}</td>
        <td>${blameLine.authorName}</td>
        <td>${blameLine.message}</td>
        <td>${dateToHumanReadable(blameLine.commitDate)}</td>
      </tr>
      `);
  });
};

export default addBlametoDoc;
