# Watermelon GitHub Plugin for Visual Studio Code

[![Report an issue](https://img.shields.io/badge/-Report%20an%20issue-critical)](https://github.com/watermelontools/wm-extension/issues)

[![GitHub Repo stars](https://img.shields.io/github/stars/watermelontools/wm-extension?style=flat-square)](https://github.com/watermelontools/wm-extension/stargazers)
[![Contributors](https://img.shields.io/github/contributors/watermelontools/wm-extension?style=flat-square)](https://github.com/watermelontools/wm-extension/graphs/contributors)
[![Twitter Follow](https://img.shields.io/twitter/follow/WatermelonTools?style=flat-square)](https://twitter.com/intent/follow?screen_name=WatermelonTools)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false#review-details)
[![Slack](https://img.shields.io/badge/Slack%20Community-Watermelon-brightgreen)](https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q)


Watermelon is an **open-source** integration between **GitHub** and **Visual Studio Code**. Watermelon makes you an expert on any file instantly by running `git blame` for you and telling you why a block of code was written that way by someone else.

Watermelon allows you to highlight a piece of code to obtain its historical context.  

![watermelon screenshot](https://github.com/watermelontools/wm-extension/blob/dev/640demo.gif?raw=true)

## Usage
Simply click the Watermelon icon on the sidebar, highlight a piece of code, and then click "Run Watermelon".

Depending on the size of your GitHub history, this might take a few seconds.

Alternatively, you can <a href="https://github.com/watermelontools/wm-extension#commands">run with our `watermelon.start` command</a>

You may also highlight and right click on the code, you will find the 'Start Watermelon' command at the end.

## Requirements

* macOS 10.11+, Windows 10+ or Linux
* Visual Studio Code v1.63.0+
* You must have Git locally installed (try `git --version` or [install it now](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

## Installation

Download from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools).

Alternatively, you can search for "Watermelon" in VS Code's built-in extension marketplace and install from there.  
![Download on VSCode](https://user-images.githubusercontent.com/11527621/162223094-ee24a53e-7a32-49eb-ac74-d1ab4f886d11.png)

## Commands

Watermelon comes with a command that you can run from VS Code's command palette. The result is exactly the same as running a Watermelon query with the green button. Results sit in your sidebar.

|Command|Description|
|:---|:---|
|`watermelon.start`|Get the historical context of the selected block of code|

## Contributing

Check out [Contributing.md](https://github.com/watermelontools/wm-extension/blob/dev/CONTRIBUTING.md) and be aware of the [Code of Conduct](https://github.com/watermelontools/wm-extension/blob/dev/CODE_OF_CONDUCT.md)!

We're an early stage project, therefore we still have the luxury to coordinate via short chats with our contributors. If you're interested in contributing, please join our [Slack](https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q) community. 
Alternatively, comment on our issues if you plan to solve one.

## Analytics

We track users to improve our application. We store your GitHub username and whether your Watermelon query was successful or not. 

**We _don't_ store your code**

## Supporters

[![Stargazers repo roster for @watermelontools/wm-extension](https://reporoster.com/stars/dark/watermelontools/wm-extension)](https://github.com/watermelontools/wm-extension/stargazers)

[![Forkers repo roster for @watermelontools/wm-extension](https://reporoster.com/forks/dark/watermelontools/wm-extension)](https://github.com/watermelontools/wm-extension/network/members)


---

#### About Watermelon

Watermelon is built by a globally distributed team of developers devoted to making software development easier. Join our [Slack](https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q) community, follow us on [Twitter](https://twitter.com/WatermelonTools) and go to the [Watermelon blog](https://watermelon.tools/blog/blog) to get the best programming tips. 


### License

- [Apache License](https://github.com/watermelontools/wm-extension/blob/main/LICENSE)

