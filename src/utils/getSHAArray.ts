export default async function getSHAArray(
  startLine: number,
  endLine: number,
  currentlyOpenTabfilePath: string | undefined,
  gitAPI: any | undefined
): Promise<string[]> {
  let arrayOfSHAs: string[] = [];
  let blame = await gitAPI?.repositories[0].blame(
    currentlyOpenTabfilePath || "."
  );
  let blameArray = blame?.split("\n")?.slice(startLine, endLine + 1);
  let shaArray: string[] = blameArray?.map((line: any) => line.split(" ")[0]);
  arrayOfSHAs = [...new Set(shaArray)];
  return arrayOfSHAs;
}
