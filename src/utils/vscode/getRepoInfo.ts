import getGitAPI from "./getGitAPI";

export default async function getRepoInfo(): Promise<{
  ownerUsername: string;
  repoName: string;
}> {
  let gitAPI = await getGitAPI();
  let ownerUsername: string = "";
  let repoName: string = "";

  let config = await (
    await gitAPI?.repositories[0]?.getConfig("remote.origin.url")
  )?.split("/");
  if (config) {
    repoName = config[4].split(".")[0];
    ownerUsername = config[3];
    return { ownerUsername, repoName };
  } else {
    return { ownerUsername: "watermelon", repoName: "watermelon" };
  }
}
