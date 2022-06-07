export default async function getNumberOfFileChanges(
  filePath: string,
  gitAPI: any | undefined
): Promise<number> {
  let blame = await gitAPI?.repositories[0].blame(filePath);

  let blameLines = blame?.split("\n");
  let commits = blameLines.map((line: String) => line.split(" ")[0]);
  let commitCount = 1;
  //count each commit different from the one before
  for (let i = 1; i < commits.length; i++) {
    if (commits[i] !== commits[i - 1]) {
      commitCount++;
    }
  }

  console.log(commitCount);

  return commitCount;
}
