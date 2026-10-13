# REELFLIX — System Architecture & Design Document (HLD & LLD)

## 1. High-Level Design (HLD)

REELFLIX is architected as a modern, high-performance, resilient video streaming and subscription platform. The system separates concerns between client-side interactive presentation, secure edge/API routing, core micro-domain logic, transactional persistence, and content delivery networks.

```mermaid
graph TD
    Client["React 19 + Vite Web Application\n(Tailwind CSS, Glassmorphic UI)"]
    CDN["Content Delivery Network (CDN)\nEdge Video & Image Cache"]
    Gateway["HTTPS / API Gateway\nExpress.js Reverse Proxy & Rate Limiter"]
    
    subgraph "Core Backend Services"
        AuthSvc["Authentication Service\n(JWT, Bcrypt, RBAC)"]
        CatSvc["Catalogue Service\n(Search, Filters, Recommendations)"]
        SubSvc["Subscription & Entitlement Service\n(Plans, Billing, Status State Machine)"]
        PlaySvc["Playback Authorization Service\n(Session Tokens, Heartbeats)"]
        WatchSvc["Watchlist & Progress Service\n(Resume Points, User Lists)"]
        AdminSvc["Admin Management Service\n(Metrics, Content Ingestion)"]
    end
    
    DB[("PostgreSQL Database\n(Prisma ORM Relations)")]
    Storage["Object Storage (S3-Compatible)\n(Encrypted MP4 & HLS Chunks)"]

    Client -->|API Requests| Gateway
    Client -->|Stream Playback| CDN
    CDN -->|Origin Media| Storage
    Gateway --> AuthSvc
    Gateway --> CatSvc
    Gateway --> SubSvc
    Gateway --> PlaySvc
    Gateway --> WatchSvc
    Gateway --> AdminSvc
    
    AuthSvc --> DB
    CatSvc --> DB
    SubSvc --> DB
    PlaySvc --> DB
    WatchSvc --> DB
    AdminSvc --> DB
```

---

## 2. Low-Level Design (LLD)

### UML Class & Domain Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String passwordHash
        +Role role
        +DateTime createdAt
        +register()
        +login()
        +hasActiveSubscription() Boolean
    }

    class Video {
        +String id
        +String title
        +String description
        +ContentType contentType
        +String posterUrl
        +String backdropUrl
        +String mediaUrl
        +Float ratingScore
        +Boolean isPublished
        +Boolean isFeatured
        +Boolean isTrending
        +Int viewCount
    }

    class Plan {
        +String id
        +String name
        +Float price
        +String billingInterval
        +String maxResolution
        +Int maxDevices
        +String[] features
    }

    class Subscription {
        +String id
        +String userId
        +String planId
        +SubscriptionStatus status
        +DateTime startDate
        +DateTime endDate
        +Boolean autoRenew
        +isActive() Boolean
        +cancel()
        +renew()
    }

    class Payment {
        +String id
        +String userId
        +String subscriptionId
        +Float amount
        +String provider
        +String status
        +verify()
    }

    class PlaybackSession {
        +String id
        +String userId
        +String videoId
        +String sessionToken
        +String status
        +DateTime lastHeartbeatAt
        +heartbeat()
        +terminate()
    }

    class ViewingProgress {
        +String id
        +String userId
        +String videoId
        +Int positionSeconds
        +Int durationSeconds
        +Boolean completed
        +updatePosition(pos, dur)
    }

    User "1" --> "*" Subscription : maintains
    User "1" --> "*" Payment : performs
    User "1" --> "*" ViewingProgress : records
    User "1" --> "*" PlaybackSession : starts
    Subscription "1" --> "1" Plan : references
    Subscription "1" --> "*" Payment : billed via
    PlaybackSession "1" --> "1" Video : streams
    ViewingProgress "1" --> "1" Video : tracks
```

---

## 3. Playback Entitlement Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant API as Playback API
    participant Sub as Subscription Service
    participant Sess as Session Manager
    participant Video as Video Origin

    User->>API: POST /api/playback/:id/authorize (Bearer Token)
    API->>Sub: Check active subscription & plan quality
    alt Subscription Invalid or Missing
        Sub-->>API: 403 Forbidden (SUBSCRIPTION_REQUIRED)
        API-->>User: Prompt Plan Subscription Modal
    else Subscription Active
        Sub-->>API: Active (Plan: Premium, Max Quality: 4K UHD)
        API->>Sess: Generate short-lived playback session token
        Sess-->>API: SessionToken
        API-->>User: 200 OK (SessionToken, StreamURL, ResumePosition)
        User->>Video: Stream Video Chunks
        loop Every 5 Seconds
            User->>API: POST /api/playback/heartbeat (SessionToken, CurrentPosition)
            API->>Sess: Refresh heartbeat timestamp & save viewing position
        end
    end
```

---

## 4. Scalability & Microservices Evolution
1. **API Gateway & Rate Limiting**: Production ingress uses NGINX or Envoy to rate-limit sensitive endpoints (e.g. 5 login attempts per minute).
2. **Video Transcoding Pipeline**: Videos uploaded to S3 trigger AWS Elemental MediaConvert / FFmpeg worker queues to produce multi-bitrate HLS streams (1080p, 720p, 480p).
3. **Redis Caching Layer**: Trending titles, home hero configurations, and user session tokens are cached in Redis with TTLs (e.g., 300s) to reduce database load by up to 90%.
