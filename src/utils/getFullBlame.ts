export default async function getFullBlame(
  startLine: number,
  endLine: number,
  currentlyOpenTabfilePath: string | undefined,
  gitAPI: any | undefined
): Promise<string[]> {
  let blameArray: string[] = [];
  let blame = await gitAPI?.repositories[0].blame(
    currentlyOpenTabfilePath || "."
  );

  let blameLines = blame?.split("\n").slice(startLine, endLine + 1);
  let commits = blameLines.map((line: String) => line.split(" ")[0]);
  let fullCommits = commits.map((commit: String) => {
    return gitAPI?.repositories[0].getCommit(commit);
  });

  return fullCommits;
}
