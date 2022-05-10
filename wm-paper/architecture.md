# Architecture

```mermaid
flowchart TD
    subgraph VSCode
    A[VSCode] --sendMessage--> B{WebView}
    B --postMessage--> A
    end
    subgraph The Internet
    direction BT
    C[github]
        subgraph Analytics
        D[watermelon]
        E[sentry]
        end
    end
    C --fetch--> A
    C -- fetch --> B
    B -- post --> D
    B -- post --> E
    
``` 