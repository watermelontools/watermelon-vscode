import getGitAPI from "../getGitAPI";

export default async function  getLocalUser(): Promise<string | undefined> {
  let gitAPI = await getGitAPI();
  let localUser: string | undefined = "";

  localUser = await gitAPI?.repositories[0]?.getGlobalConfig("user.name");
  return localUser;
}

