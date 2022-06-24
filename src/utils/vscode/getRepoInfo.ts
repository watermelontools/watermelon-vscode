import getGitAPI from "./getGitAPI";
import { nonGHRepo } from "./showErrors";
import * as gitURLparse from "git-url-parse";

export default async function getRepoInfo(): Promise<{
  owner: string;
  repo: string;
} | void> {
  let gitAPI = await getGitAPI();
  let owner: string = "";
  let repo: string = "";

  let config = await await gitAPI?.repositories[0]?.getConfig(
    "remote.origin.url"
  );
  if (config) {
    let parsed = gitURLparse(config);
    owner = parsed.owner;
    repo = parsed.name;
    if (!(parsed.source.includes("github"))) {
      nonGHRepo();
    }
  }

  return { owner, repo };
}
