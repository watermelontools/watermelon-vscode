async function getNumberOfFileChanges(gitAPI:any, filePath:string){
    let blames = await gitAPI?.repositories[0].blame(
        filePath || "."
    );
    const numberOfLinesInBlame = blames.length;
    return numberOfLinesInBlame;
}
export default getNumberOfFileChanges;