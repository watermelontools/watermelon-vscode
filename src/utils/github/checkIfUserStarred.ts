export default async function checkIfUserStarred({ octokit }: { octokit: any }) {
    let octoresp = await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser(
      {
        owner: 'watermelontools',
        repo: 'wm-extension'
      });
      console.log("isstared func ",octoresp.error);
    
  }
  