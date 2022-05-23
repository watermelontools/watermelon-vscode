import getGitAPI from "./getGitAPI";

export default async function getRepoInfo(): Promise<{
  ownerUsername: string;
  repoName: string;
}> {
  let gitAPI = await getGitAPI();
  let ownerUsername: string = "";
  let repoName: string = "";

  let config = await await gitAPI?.repositories[0]?.getConfig(
    "remote.origin.url"
  );
  if (config?.includes("https://")) {
    repoName = config?.split("/")[4].split(".")[0];
    ownerUsername = config?.split("/")[3];
  } else {
    repoName = config?.split("/")[1].split(".")[0] ?? "";
    ownerUsername = config?.split(":")[1].split("/")[0] ?? "";
  }
  return { ownerUsername, repoName };
}
