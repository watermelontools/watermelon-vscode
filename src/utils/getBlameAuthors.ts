export default async function getAuthorArray(
  startLine: number,
  endLine: number,
  currentlyOpenTabfilePath: string | undefined,
  gitAPI: any | undefined
): Promise<string[]> {
  let arrayOfAuthors: string[] = [];
  let blame = await gitAPI?.repositories[0].blame(
    currentlyOpenTabfilePath || "."
  );
  let blameLines = blame?.split("\n").slice(startLine, endLine + 1);
  let authors = blameLines.map((line: String) => line.split(/[(]|\s\s|202|201|200/)[1]);

  let authorFreq = authors.reduce(
    (acc: { [x: string]: any }, curr: string | number) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    },
    {}
  );
  arrayOfAuthors = Object.keys(authorFreq).sort((a, b) => authorFreq[b] - authorFreq[a]);
  let authorsSorted = [...new Set(arrayOfAuthors)];

  return authorsSorted;
}
