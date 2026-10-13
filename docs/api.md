# REELFLIX — REST API Specification

All API endpoints reside under the `/api` prefix and communicate using standard JSON payloads.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": "user-123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "createdAt": "2026-10-13T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### `POST /api/auth/login`
Authenticates with email and password, issuing a JWT.
- **Request Body**:
  ```json
  {
    "email": "demo@reelflix.com",
    "password": "User@1234"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": { "id": "...", "email": "...", "role": "USER" },
    "token": "..."
  }
  ```

### `GET /api/auth/me`
Fetches current user profile and active subscription details.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Returns user info and active subscription.

---

## 2. Catalogue Endpoints

### `GET /api/videos`
Retrieves paginated, filtered, and sorted videos.
- **Query Parameters**:
  - `genre`: Genre slug (e.g. `action`, `sci-fi`)
  - `contentType`: `MOVIE` | `SERIES`
  - `search`: Keyword search for titles, descriptions, genres
  - `sortBy`: `popularity` | `newest` | `rating`
  - `page`: Page index (default: 1)
  - `limit`: Number of items (default: 20)

### `GET /api/videos/featured`
Returns the currently configured hero premiere video.

### `GET /api/videos/trending`
Returns the weekly trending titles.

### `GET /api/videos/:id`
Returns full video details, including synopsis, genres, duration, and technical format.

---

## 3. Subscription & Billing Endpoints

### `GET /api/plans`
Returns the list of available subscription plans (`BASIC`, `STANDARD`, `PREMIUM`).

### `GET /api/subscriptions/me`
Retrieves current user's active plan, expiry date, and status.

### `POST /api/subscriptions`
Creates or upgrades a subscription.
- **Request Body**:
  ```json
  {
    "planId": "plan-premium",
    "paymentMode": "DEMO"
  }
  ```

### `POST /api/subscriptions/:id/cancel`
Cancels the user's active recurring subscription.

### `POST /api/subscriptions/:id/renew`
Renews an expired or expiring subscription for an additional 30 days.

---

## 4. Playback & Viewing Progress

### `POST /api/playback/:videoId/authorize`
Verifies user entitlements before issuing short-lived playback token.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "sessionToken": "session_17288192_abc98",
    "mediaUrl": "https://.../video.mp4",
    "title": "CHRONO: The Infinite Paradox",
    "resumePosition": 240,
    "maxResolution": "4K UHD + HDR",
    "planName": "PREMIUM"
  }
  ```

### `POST /api/playback/heartbeat`
Refreshes the active stream session.

### `GET /api/progress`
Returns viewing progress for all partially watched titles (Continue Watching).

### `PUT /api/progress/:videoId`
Saves current playback position in seconds.

---

## 5. Administration Endpoints (Admin Role Only)

### `GET /api/admin/dashboard`
Returns total registered users, active subscriptions, total videos, revenue, and recent payments.

### `GET /api/admin/users`
Lists all registered users and their roles.

### `POST /api/admin/videos`
Adds a new title to the streaming catalogue.

### `DELETE /api/admin/videos/:id`
Deletes a title from the streaming catalogue.
