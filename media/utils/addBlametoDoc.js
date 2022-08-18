import dateToHumanReadable from "./dateToHumanReadable.js";

const paintBlameTable = (blameArray, commitLink) => {
  //sort array by date, newest first
  blameArray.sort((a, b) => {
    return new Date(b.commitDate) - new Date(a.commitDate);
  });

  blameArray.forEach((blameLine, index) => {
    $(".blame-rows").append(`
      <tr ${index % 2 === 1 ? 'class="Box-row--gray"' : ""}>
        <td>
        ${
          commitLink
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
const addViewMoreCommitsButton = (blameArray, commitLink) => {
  $(".blame-rows").append(`

    <tr>
      <td colspan="4">
        <button class="view-more-commits btn btn-primary" type="button">View More Commits</button>
      </td>
    </tr>
  `);
  $(".view-more-commits").on("click", (event) => {
    paintBlameTable(blameArray, commitLink);
    $(".view-more-commits").remove();
  });
};

const addBlametoDoc = (blameArray, commitLink) => {
  $("#ghHolder").append(`
    <h3>Commits</h3>
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
  let sortedBlameArray = blameArray.sort((a, b) => {
    new Date(b.commitDate) - new Date(a.commitDate);
  });
  const firstCommit = sortedBlameArray.shift();
  paintBlameTable([firstCommit], commitLink);
  if (sortedBlameArray.length > 0) {
    addViewMoreCommitsButton(sortedBlameArray, commitLink);
  }
};

export default addBlametoDoc;
