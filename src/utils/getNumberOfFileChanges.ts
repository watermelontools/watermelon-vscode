async function getNumberOfFileChanges(gitAPI:any, filePath:string){
    let blames = await gitAPI?.repositories[0].blame(
        filePath || "."
    );
    let commitHashArray = [] as String[];
    let splitBlames = blames.split("\n").map((line:string) => {
        commitHashArray.push(line.split(" ")[0]);
    });

    // get number of unique entries in commitHashArray
    let uniqueCommitHashArray = [...new Set(commitHashArray)];
    return uniqueCommitHashArray.length;
}
export default getNumberOfFileChanges;