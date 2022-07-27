import addActionButtons from "./addActionButtons.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import replaceHyperlinks from "./replaceHyperlinks.js";

const addSingleBlametoDoc = (blameArray, commitLink) => {
  addActionButtons();
  $("#ghHolder").append(`
    <h3>Latest Commit</h3>
    `);
  $("#ghHolder").append(`
    <table class="Box anim-fade-in">
      <thead class="Box-header">
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

  //sort array by date, newest first
  blameArray.sort((a, b) => {
    return new Date(b.commitDate) - new Date(a.commitDate);
  });

  $(".blame-rows").append(`
    <tr>
      <td>
      ${
        commitLink
          ? `<a href='${commitLink}${blameArray[0]?.hash}'>
            ${blameArray[0]?.hash?.slice(0, 7)}
            </a>`
          : blameArray[0]?.hash?.slice(0, 7)
      }
      </td>
      <td>${blameArray[0].authorName}</td>
      <td>${(blameArray[0].message)}</td>
      <td>${dateToHumanReadable(blameArray[0].commitDate)}</td>
    </tr>
  `);
};

export default addSingleBlametoDoc;
