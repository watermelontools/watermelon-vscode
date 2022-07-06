import getGitAPI from "./getGitAPI";
import { nonGHRepo } from "./showErrors";
import gitUrlParse = require("git-url-parse");
import TelemetryReporter from "@vscode/extension-telemetry";

export default async function getRepoInfo({ repoURL, reporter }: { repoURL?: string, reporter?: TelemetryReporter | null }): Promise<{
  owner: string;
  repo: string;
  source: string;
  protocol: string;
}> {
  let gitAPI = await getGitAPI();
  let owner: string = "";
  let repo: string = "";
  let source: string = "";
  let protocol: string = "";

  if (!repoURL) {
    try {

      let config = await gitAPI?.repositories[0]?.getConfig(
        "remote.origin.url"
      );
      if (config) {
        let parsed = gitUrlParse(config);
        owner = parsed.owner;
        repo = parsed.name;
        source = parsed.source;
        protocol = parsed.protocol;
        if (!(source.includes("github"))) {
          nonGHRepo();
        }
      }
    } catch (e: any) {
      reporter?.sendTelemetryErrorEvent("getRepoInfo", { e });
    }
  } else {
    let parsed = gitUrlParse(repoURL);
    owner = parsed.owner;
    repo = parsed.name;
    source = parsed.source;
    protocol = parsed.protocol;
    if (!(source.includes("github"))) {
      nonGHRepo();
    }
  }
  return { owner, repo, source, protocol };
}
