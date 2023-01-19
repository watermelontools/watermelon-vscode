import * as vscode from "vscode";
import path = require("path");
export class ContextItem extends vscode.TreeItem {
  children: any;
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly version: string,
    public readonly command?: vscode.Command,
    children?: ContextItem[]
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
    this.children = children;
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "images", "wmbw_bold_fill.svg"),
    dark: path.join(__filename, "..", "..", "images", "wmbw_bold_fill.svg"),
  };

  contextValue = "dependency";
}
