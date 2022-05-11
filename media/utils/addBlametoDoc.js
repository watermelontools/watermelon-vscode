import dateToHumanReadable from "./dateToHumanReadable.js";

const addBlametoDoc = (blameArray) => {
  console.log(blameArray);
  $("#ghHolder").append(
    "<button class='run-watermelon'>Run Watermelon</button><br/>"
  );

  $("#ghHolder").append(
    `<button class='create-docs'>Create repo docs</button>`
  );
  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
  $(".create-docs").on("click", (event) => {
    sendMessage({ command: "create-docs" });
  });
  $("#ghHolder").append(`
    <h3>Pull Requests</h3>
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
      <tr>
        <td>${blameLine?.hash?.slice(0,7)}</td>
        <td>${blameLine.authorName}</td>
        <td>${blameLine.message}</td>
        <td>${dateToHumanReadable(blameLine.commitDate)}</td>
      </tr>
      `);
  });
};

export default addBlametoDoc;
