```mermaid
flowchart TD
    subgraph Client
        UI[React Frontend]
        LC[Local Cache]
    end

    subgraph Server
        API[Express API Server]
        Auth[JWT Auth Middleware]
        Controllers[API Controllers]
    end

    subgraph Database
        PG[(PostgreSQL)]
    end

    UI --> |HTTP Requests| API
    API --> |Validate Token| Auth
    Auth --> |Authorized| Controllers
    Controllers --> |CRUD Operations| PG
    Controllers --> |Response| UI
    UI <--> |Store/Read| LC