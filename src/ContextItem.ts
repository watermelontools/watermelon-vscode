import * as vscode from "vscode";
import path = require("path");
export class ContextItem extends vscode.TreeItem {
  children: any;
  iconPath: vscode.TreeItem["iconPath"];

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly version: string,
    public readonly command?: vscode.Command,
    children?: ContextItem[],
    public readonly logo?: string,
    public readonly elementType?: string,
    public readonly metadata?: any
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
    this.children = children;
    this.logo = logo;
    this.elementType = elementType;
    this.metadata = metadata;

    if (this.logo === undefined) {
      this.iconPath = undefined;
    } else if (this.logo.includes("http")) {
      this.iconPath = vscode.Uri.parse(this.logo);
    } else {
      const iconFile = path.join(
        __filename,
        "..",
        "..",
        "images",
        "logos",
        `${this.logo ? this.logo : "wmbw_bold_fill"}.svg`
      );
      this.iconPath = {
        light: vscode.Uri.file(iconFile),
        dark: vscode.Uri.file(iconFile),
      };
    }
  }

  contextValue = this.elementType;
}
