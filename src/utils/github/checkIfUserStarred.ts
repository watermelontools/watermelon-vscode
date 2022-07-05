import debugLogger from "../vscode/debugLogger";

export default async function checkIfUserStarred({
  octokit,
}: {
  octokit: any;
}) {
  // @ts-ignore
  let isStarred = await octokit.rest.activity
    .checkRepoIsStarredByAuthenticatedUser({
      owner: "watermelontools",
      repo: "wm-extension",
    })
    .then((res: any) => {
      debugLogger(res.status);
      if (res.status === 204) {
        return true;
      }
    })
    .catch((err: any) => {
      debugLogger(err.status);
      if (err.status === 404) {
        return false;
      }
    });
  return await isStarred;
}
