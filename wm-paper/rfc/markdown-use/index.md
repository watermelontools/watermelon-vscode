# Markdown as paper renderer  
## Introduction   
[GitHub Flavored Markdown](https://github.github.com/gfm/) is an specification that extends markdown as a whole. It renders on the webpage properly and allows pretty complicated stuff.

For this RFC, the proposal is to put that into the markdown renderer on VSCode to extend the capabilities of documentation in the programmers workflow. One of the huge pain points is that systems are complicated and distant from the code, where programmers are at home.

There are no "steps" to use it, but we need to tell the developer. 

## How it looks
See [mermaid-examples](mermaid-examples.md)
## Technical challenges
Interestingly, marked, the chosen markdown renderer does have a [GFC option](https://marked.js.org/using_advanced#options) to help us in the task.  
We already have highlight js to style code.

The webview may support [adding mermaid from a CDN](https://mermaid-js.github.io/mermaid/#/n00b-gettingStarted?id=_4-adding-mermaid-as-a-dependency).
## Discussion

I wrote this RFC on VSCode with the preview open, so it works, we just need to extend it.  As a personal case, I did not remember the name of our md parser so I used <kbd>ctrl</kbd> + <kbd>shift</kbd> +<kbd>f</kbd> to find it so there's value in co-location of docs.

## Risks

This might be minor but the extension might bloat or start slower due to these. Developers usually have powerful machines but it's something to test.
