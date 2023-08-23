# Contributing to Watermelon's extension development

For now, we discuss on [Discord](https://t.co/fMIlnb9egq).

Anyone is free to contribute changes to any file in this repository. You don't need to ask for permission or get in line. If you see an issue that's open and it seems interesting to you, feel free to pick it up. Your solution may be better. Open-source is beautiful. 

## Running the extension
To run:
1. Open the folder containing the code on [VSCode](https://code.visualstudio.com/download).
2. Run `npm install`.
3. Press "F5" or go to the debug panel and click "Run Extension".

Make sure you:
1. Have logged in with your github account on VSCode.
2. The folder you are accessing is NOT in restricted mode.

When commiting, our all the tests will run to check nothing broke.

## Issues
If there's something you'd like to see please [open an issue](https://github.com/watermelontools/wm-extension/issues/new).

## PRs

We love community contributions. Please fork the repo and send a PR our way.

Remember, we'll discuss it publicly, it's a great opportunity to learn.

### Sources

#### VSCode
- [The Offical VSCode API docs](https://code.visualstudio.com/api/references/vscode-api)
- [Offial VSCode API Samples](https://github.com/microsoft/vscode-extension-samples)
- [Haxe](https://vshaxe.github.io/vscode-extern/)
- [VCSCode can do that?](https://vscodecandothat.com/)
Also, take a look at [the official quickstart on this repo](/vsc-extension-quickstart.md)
#### Octokit (SDK for GitHub)

- [Octokit](https://octokit.github.io/)

## Brand

We prefer to use [Codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html) and [Primer Design](https://primer.style/) for our extension, but are elastic in UI decisions.

## Donations
[We have Github Sponsors](https://github.com/sponsors/watermelontools)  
Also star :star: the repo to help!

## Release

### VSCode

To release a new version of the extension, we use [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce). This requires being part of the team and having access to the [VSCode Marketplace](https://marketplace.visualstudio.com/manage/publishers/watermelon-tools).

First, create a PR from `dev` to `master` with the title _v{version_number}_ (e.g. v1.6.3). Then, test it and get at least one approval.

Second, on your local machine, pull the latest `master` and run `vsce publish {version_name}`. This will publish the new version to the marketplace.

### VSCodium

We use the .vsix from the VSCode Marketplace to publish to VSCodium. After the previous steps, run `npx ovsx publish -p {your_token}` to release the new version to VSCodium. This generally takes longer than the VSCode Marketplace.
