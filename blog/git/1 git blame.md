## The cool git: 1. Git Bisect

**TL;DR:** Use binary search to find the commit that introduced a bug.

**For humans:** Take 2 commits and start removing halves until you find the error.

The command `git blame` has been my ally in those times that the bug is a mistery. It has allowed me to go back in history and see the commit that broke something. Usually it's me being a detective for my own murder.

As simple as it sounds, it takes a "correct" commit and a boken one and with binary search, it allows you to find the offending one _fast_.

```mermaid
flowchart 
    id1((x))
    id2["X(s)"]
    id3["G(s)"]
    id4["H(s)"]
    id5["Y(s)"]
    id1 --> id3
    id2 --> id1
    id3 --> sid1
    sid1 --> id4
    id4 --> id1
    sid1 --> id5
    subgraph sid1 ["Z(s)G(S)"]
    end
```
