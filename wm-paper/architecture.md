# Architecture

```mermaid
flowchart TD
    A[VSCode] --sendMessage--> B{WebView}
    A --post--> C
    B -- fetch --> C[The Internet]
    B --postMessage--> A
    C --post--> B
    C --post--> A
    
``` 