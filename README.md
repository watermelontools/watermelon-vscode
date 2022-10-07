# Watermelon GitHub Plugin for Visual Studio Code

[![Report an issue](https://img.shields.io/badge/-Report%20an%20issue-critical)](https://github.com/watermelontools/wm-extension/issues)
[![GitHub Repo stars](https://img.shields.io/github/stars/watermelontools/wm-extension?style=flat-square)](https://github.com/watermelontools/wm-extension/stargazers)
[![Contributors](https://img.shields.io/github/contributors/watermelontools/wm-extension?style=flat-square)](https://github.com/watermelontools/wm-extension/graphs/contributors)
[![Twitter Follow](https://img.shields.io/twitter/follow/WatermelonTools?style=flat-square)](https://twitter.com/intent/follow?screen_name=WatermelonTools)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false#review-details)
[![Discord](https://img.shields.io/discord/933846506438541492?style=flat-square)](discord.gg/xNDFXx9447)

Watermelon is an **open-source** integration between **GitHub** and **Visual Studio Code** to help developers go beyond Git Blame. Watermelon makes you an expert on any file instantly by running `git blame` for you and telling you why a block of code was written that way by someone else.

## Features

Watermelon has 3 main features that you can use:

- View Git Blame
- View Pull Requests
- Daily Summary

The main UI to use Watermelon is the context box you see when you hover over lines of code with our extension installed. This UI is complemented with the sidebar we have.

In the image below you can see how hovering over a line of code provides us the following data:

![hover](https://github.com/watermelontools/wm-extension/blob/dev/hover-showcase.gif?raw=true)

- The latest commit message for that line
- The amount of changes for the file that you're currently in, usually called churn

If you want to do a deeper research about the code context history, simply click one of the links in the context box.

### View Commit History

Highlight a piece of code, and then click the `View Commit History` button. We will run Git Blame for you, and give you a table with the Git commit messages relevant to the piece of code you highlighted.

![commit-hisotry](https://user-images.githubusercontent.com/47119689/178702441-d0afccbd-5230-456e-a9fb-56b36e36a146.gif)

You may also highlight and right click on the code, you will find the 'View Commit History with Watermelon' command at the end.

As a final way to use, only with your keyboard, you may pull the Command Palette (<kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> on Windows and Linux and <kbd>CMD</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> on Mac) and type "Get commit history with Watermelon".

### View Pull Requests

Highlight a piece of code, and then click the View Pull Requests button to run Git Blame on the background. We will get the PR bodies and comments that are relevant to the highlighted piece of code for you.

Depending on the size of your GitHub history, this might take a few seconds.

![pull-request](https://user-images.githubusercontent.com/47119689/178702586-d94d72b6-8457-406d-8f38-df6382cc436c.gif)

Alternatively, you can <a href="https://github.com/watermelontools/wm-extension#commands">run with our `watermelon.start` command</a>

You may also highlight and right click on the code, you will find the 'Get Pull Requests with Watermelon' command at the end.

### Daily Summary

Get an overview of which issues and PR reviews are assigned to you. Both on the current repository and across all GitHub. 

Also, login to Jira to view your Tickets in Progress.

To use it, open the Watermelon sidebar.

![daily-summary](https://github.com/watermelontools/wm-extension/blob/dev/daily-summary-showcase.png?raw=true)

## Requirements

- macOS 10.11+, Windows 10+ or Linux
- Visual Studio Code v1.63.0+
- You must have Git locally installed (try `git --version` or [install it now](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

## Installation

Download from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools).

Alternatively, you can search for "Watermelon" in VS Code's built-in extension marketplace and install from there.  
![Download on VSCode](https://user-images.githubusercontent.com/11527621/162223094-ee24a53e-7a32-49eb-ac74-d1ab4f886d11.png)

## Commands

Watermelon comes with a few commands that you can run from VS Code's Command Palette. The result is exactly the same as running a Watermelon query with the green button. Results sit in your sidebar.

| Command                | Description                                              |
| :--------------------- | :------------------------------------------------------- |
| `watermelon.start`     | Get the historical context of the selected block of code |
| `watermelon.show`      | Reveal the extension                                     |
| `watermelon.recommend` | Add the extension to the list of recommended             |
| `watermelon.login`     | Login using GitHub                                       |

## Shortcuts

As an alternative, you can use the following shortcuts:

- `Ctrl+Shift+C` (`Cmd+Shift+C` on Mac) to view Pull Requests

## Contributing

Check out [Contributing.md](CONTRIBUTING.md) and be aware of the [Code of Conduct](CODE_OF_CONDUCT.md)!

We're an early stage project, therefore we still have the luxury to coordinate via short chats with our contributors. If you're interested in contributing, please join our [Slack](https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q) community.
Alternatively, comment on our issues if you plan to solve one.

## Analytics

We track user actions in an anonymous manner to improve our application. We store your GitHub username, repo name and organization.

**We _don't_ store your code**

## Supporters

[![Stargazers repo roster for @watermelontools/wm-extension](https://reporoster.com/stars/dark/watermelontools/wm-extension)](https://github.com/watermelontools/wm-extension/stargazers)

[![Forkers repo roster for @watermelontools/wm-extension](https://reporoster.com/forks/dark/watermelontools/wm-extension)](https://github.com/watermelontools/wm-extension/network/members)

---

#### About Watermelon

Watermelon is built by a globally distributed team of developers devoted to making software development easier. Join our [Slack](https://join.slack.com/t/watermelonusers/shared_invite/zt-15bjnr3rm-uoz8QMb1HMVB4Qywvq94~Q) community, follow us on [Twitter](https://twitter.com/WatermelonTools) and go to the [Watermelon blog](https://watermelon.tools/blog/blog) to get the best programming tips.

### License

- [Apache License](license.md)
