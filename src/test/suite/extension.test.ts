import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import sleep from "./utils/sleep";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });
  vscode.window.showInformationMessage("Now testing the extension.");

  // test that the extension is present
  test("Extension is present", () => {
    assert.ok(
      vscode.extensions.getExtension("WatermelonTools.watermelon-tools")
    );
  });
  // test that the extension is activated
  test("Extension is activated", async() => {
    await sleep(1500);
    assert.ok(
      vscode.extensions.getExtension("WatermelonTools.watermelon-tools")?.isActive
    );
  });
});
