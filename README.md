# Watermelon GitHub Plugin for Visual Studio Code

[![Report an issue](https://img.shields.io/badge/-Report%20an%20issue-critical)](https://github.com/watermelontools/watermelon-extension/issues)

[![GitHub Repo stars](https://img.shields.io/github/stars/watermelontools/watermelon-extension?style=flat-square)](https://github.com/watermelontools/watermelon-extension/stargazers)
[![Contributors](https://img.shields.io/github/contributors/watermelontools/watermelon-extension?style=flat-square)](https://github.com/watermelontools/watermelon-extension/graphs/contributors)
[![Twitter Follow](https://img.shields.io/twitter/follow/WatermelonTools?style=flat-square)](https://twitter.com/intent/follow?screen_name=WatermelonTools)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/WatermelonTools.watermelon-tools?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools&ssr=false#review-details)
[![Discord](https://img.shields.io/discord/933846506438541492?style=flat-square)](https://discord.com/invite/H4AE6b9442)

Watermelon is your **Open Source** Code Archeology Toolbox for **Visual Studio Code**. We allow developers to find the most relevant piece of context for a given block of code. We help you __grok__ codebases by indexing information from git, ticketing, and messaging systems. 

## Free Features

Watermelon has 2 features that you can use for free:

- Hover to get context
- Get most relevant Pull Request (50 queries per month)

### Hover To Get Context

The fastest way to use Watermelon is to hover over a line of code to get its context.

In the image below you can see how hovering over a line of code provides us the following:

![hover](https://thumbs.gfycat.com/EcstaticSpryAracari-size_restricted.gif)

- The author and date of the latest commit
- The message of the latest commit
- The number of times the current file has changed
- A button that says "View the code context with Watermelon"

If you want to do a deeper research about the code context history, simply click such button. 

### Get Full Code Context

Highlight a piece of code to get its full code context from git (free), ticketing and messaging (paid) systems. There are 3 ways you can use this feature.

NOTE: This takes up to 20 seconds right now. Please be patient while we work on making this faster. 

#### Click get code context button on the sidebar
![sidebarButton](https://thumbs.gfycat.com/AccurateKeenLabradorretriever-size_restricted.gif)

#### Click button from the hover context box
![hoverGetContext](https://thumbs.gfycat.com/CharmingSharpChuckwalla-size_restricted.gif)

#### Click get code context button on the right-click menu
![rightClickMenu](https://thumbs.gfycat.com/MeaslyNarrowGoat-size_restricted.gif)


## Paid Features

In addition to getting  unlimited code context queries, paying for Watermelon also gives you access to context from the following sources via its integrations:

- Jira (get the most relevant ticket)
- Slack (get the most relevant message thread)

More integrations coming soon!

## Requirements

- macOS 10.11+, Windows 10+ or Linux
- Visual Studio Code v1.63.0+
- Visual Studio Code Insiders v1.63.0+
- VS Codium v1.63.0+ (BETA INTEGRATION)
- You must have Git locally installed (try `git --version` or [install it now](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

## Installation

Download from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=WatermelonTools.watermelon-tools).

Alternatively, you can search for "Watermelon" in VS Code's built-in extension marketplace and install from there.  
![Download on VSCode](https://user-images.githubusercontent.com/11527621/162223094-ee24a53e-7a32-49eb-ac74-d1ab4f886d11.png)

Download from the [VS Codium Marketplace (Open VSX Registry)](https://open-vsx.org/extension/WatermelonTools/watermelon-tools)

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

We're an early stage project, therefore we still have the luxury to coordinate via short chats with our contributors. If you're interested in contributing, please join our [Discord](https://discord.com/invite/H4AE6b9442) community.
Alternatively, comment on our issues if you plan to solve one.

## Analytics

We use [VS Code's telemetry library](https://github.com/microsoft/vscode-extension-telemetry). The library respects the user's decision about whether or not to send telemetry data.

**We _don't_ store your code**

## Supporters

[![Stargazers repo roster for @watermelontools/watermelon-extension](https://reporoster.com/stars/watermelontools/watermelon-extension)](https://github.com/watermelontools/watermelon-extension/stargazers)

[![Forkers repo roster for @watermelontools/watermelon-extension](https://reporoster.com/forks/watermelontools/watermelon-extension)](https://github.com/watermelontools/watermelon-extension/network/members)

---

#### About Watermelon

Watermelon is built by a globally distributed team of developers devoted to making software development easier. Join our [Discord](https://discord.com/invite/H4AE6b9442) community, follow us on [Twitter](https://twitter.com/WatermelonTools) and go to the [Watermelon blog](https://watermelon.tools/blog/blog) to get the best programming tips.

### License

- [Apache License](license.md)
