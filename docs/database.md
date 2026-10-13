# REELFLIX — Database Schema & Data Modeling

The REELFLIX relational schema is designed with strict integrity constraints, cascade rules, indexing on search and filtering columns, and audit timestamps.

## Entity Relationship Overview

```mermaid
erDiagram
    USER ||--o{ SUBSCRIPTION : holds
    USER ||--o{ PAYMENT : makes
    USER ||--o{ WATCHLIST_ITEM : saves
    USER ||--o{ VIEWING_PROGRESS : tracks
    USER ||--o{ PLAYBACK_SESSION : opens
    
    PLAN ||--o{ SUBSCRIPTION : defines
    SUBSCRIPTION ||--o{ PAYMENT : bills
    
    VIDEO ||--o{ VIDEO_GENRE : categorized_by
    GENRE ||--o{ VIDEO_GENRE : categorizes
    
    VIDEO ||--o{ WATCHLIST_ITEM : stored_in
    VIDEO ||--o{ VIEWING_PROGRESS : recorded_for
    VIDEO ||--o{ PLAYBACK_SESSION : streamed_in

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        datetime createdAt
    }

    VIDEO {
        string id PK
        string title
        string description
        string contentType
        string posterUrl
        string backdropUrl
        string mediaUrl
        float ratingScore
        boolean isPublished
        boolean isFeatured
        boolean isTrending
    }

    PLAN {
        string id PK
        string name UK
        float price
        string billingInterval
        string maxResolution
        int maxDevices
    }

    SUBSCRIPTION {
        string id PK
        string userId FK
        string planId FK
        string status
        datetime startDate
        datetime endDate
    }

    PAYMENT {
        string id PK
        string userId FK
        string subscriptionId FK
        float amount
        string provider
        string status
    }
```

## Key Database Constraints & Performance Indexes
- `User.email`: Unique index for fast O(1) credential lookups and preventing duplicate registrations.
- `[WatchlistItem.userId, WatchlistItem.videoId]`: Unique compound constraint ensuring a user cannot add duplicate items to their personal list.
- `[ViewingProgress.userId, ViewingProgress.videoId]`: Unique compound constraint for atomic playback position updates.
- `[Video.isFeatured, Video.isPublished]`, `[Video.isTrending, Video.isPublished]`: Composite indexes for sub-millisecond retrieval of hero premiere banners and carousel rows.
