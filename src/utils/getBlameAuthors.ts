export default async function getAuthorArray(
    startLine: number,
    endLine: number,
    currentlyOpenTabfilePath: string| undefined,
    gitAPI: any | undefined
  ): Promise<string[]> {
    let arrayOfAuthors: string[] = [];
    let blame = await gitAPI?.repositories[0].blame(
      currentlyOpenTabfilePath || "."
    );
  let blameLines= blame?.split("\n").slice(startLine, endLine + 1);
  let authors= blameLines.map((line:String)=>line.split(/[(]|\s\s\s/)[1])
  
  console.log(authors)
  
    return authors;
  }
  