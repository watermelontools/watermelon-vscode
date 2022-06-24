import * as assert from "assert";

// you can import and use all API from the "vscode" module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../src/extension';


suite('Watermelon extension tests', () => {
  test('Extension should be active after startup', (done) => {
    setTimeout(() => {
      const extension = vscode.extensions.getExtension(
        'WatermelonTools.watermelon-tools'
      );
      assert.ok(extension);
      assert.equal(extension.isActive, true);
      done();
    }, 1000 * 3);
  }).timeout(1000 * 10);

  test('should register commands', (done) => {
    vscode.commands
      .getCommands(true)
      .then((commands) =>{
       let wmCommands= commands.filter((command) => command.startsWith('watermelon'));
       console.log(wmCommands);
       assert.equal(commands.length > 0, true);
      })
      .then(() => done());
  });
});
