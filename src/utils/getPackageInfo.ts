function getPackageInfo() {
    const packageJson = require('../../package.json');
    return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
    };
}
export default getPackageInfo;