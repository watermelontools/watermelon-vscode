import * as assert from "assert";

// you can import and use all API from the "vscode" module
// as well as import your extension to test it
import * as vscode from "vscode";
import {
  WATERMELON_MULTI_SELECT_COMMAND,
  WATERMELON_PULLS_COMMAND,
  WATERMELON_SELECT_COMMAND,
  WATERMELON_SHOW_COMMAND,
} from "../../constants";
// import * as myExtension from '../src/extension';

suite("Watermelon extension tests", () => {
  test("Extension should be active after startup", (done) => {
    setTimeout(() => {
      const extension = vscode.extensions.getExtension(
        "WatermelonTools.watermelon-tools"
      );
      assert.ok(extension);
      assert.strictEqual(extension.isActive, true);
      done();
    }, 1000 * 3);
  }).timeout(1000 * 10);

  test("should register commands", (done) => {
    vscode.commands
      .getCommands(true)
      .then((commands) => {
        let wmCommands = commands.filter((command) =>
          command.startsWith("watermelon")
        );
        console.log(wmCommands);
        assert.strictEqual(commands.length > 0, true);
      })
      .then(() => done());
  });

  test("should show extension when show command is called", (done) => {
    vscode.commands
      .executeCommand(WATERMELON_SHOW_COMMAND)
      .then(() => {
        vscode.window.showInformationMessage("Watermelon is active!");
      })
      .then(() => done());
  });

  test("should contain all  commands", (done) => {
    vscode.commands
      .getCommands(true)
      .then((commands) => {
        let wmCommands = commands.filter((command) =>
          command.startsWith("watermelon")
        );
        let commandList = [
          WATERMELON_SHOW_COMMAND,
          WATERMELON_SELECT_COMMAND,
          WATERMELON_MULTI_SELECT_COMMAND,
          WATERMELON_PULLS_COMMAND,
        ];

        assert.strictEqual(
          commandList.every((command) => wmCommands.includes(command)),
          true
        );
      })
      .then(() => done());
  });
});
