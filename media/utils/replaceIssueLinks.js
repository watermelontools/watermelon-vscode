const replaceIssueLinks = (text, repo_url) => {
  let repoLink = repo_url.replace("api.", "").replace("repos/", "");
  return text
    .replace(
      /#([0-9]*)/gm,
      `<a href="${repoLink}/pull/$1" title="View this issue on github">$&</a>`
    )
    .replaceAll(`&<a href="${repoLink}/pull/39">#39</a>;`, "'");
};
export default replaceIssueLinks;
