function escapeFilePath(path:string| undefined){
	if(path){
		// $& means the whole matched string
		return path.replace(/[. *\s+\ ?^${}()|[\]\\]/g, '\\$&');
	}
	else {return "";}
}