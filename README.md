# GitHub Profile Analyzer API

An elegant and robust Node.js & Express REST API that analyzes GitHub user profiles using the GitHub Public API, calculates developer insights (scores, grades, popular repos, and top languages), and stores the insights in a MySQL database.

---

## Key Features

1. **GitHub Profile Fetching**: Fetches public profile details (bio, followers, company, etc.) in real-time.
2. **Aggregated Repository Insights**:
   - **Total Stars Received**: Sum of stars across all public repositories.
   - **Top Languages**: Determines the top 3 most used languages.
   - **Popular Repository**: Automatically identifies the user's most starred repository.
3. **Developer Scoring & Grading System**: Automatically calculates a developer reputation score from 0 to 100 and assigns a grade based on five weighted metrics (detailed in the section below).
4. **Auto Table Initialization**: Automatically connects to the database and builds the SQL schema if it doesn't exist.
5. **Clean Architecture**: Follows a clean, modular structure (`features/github` folder containing `controller`, `service`, `model`, `routes`, `analysis`, and `constants`).
6. **Robust Error Handling**: Utilizes custom `ApiError` class and global async exception handler middleware.

---

## Developer Scoring & Grading System

The API evaluates the quality and activity of a GitHub profile by calculating a numeric score capped at **100 points**. 

### 1. Score Calculation (Weighted Metrics)

The total score is calculated using five distinct developer activity metrics:

| Metric | Points Formula | Maximum Points | Description |
|---|---|---|---|
| **Stars Received** | `starsCount * 5` | **40 points** | Total stargazers across all owned repositories. |
| **Followers** | `followers * 2` | **20 points** | Total number of followers on GitHub. |
| **Public Repositories** | `publicRepos * 1` | **15 points** | Total number of public repositories. |
| **Language Diversity** | `uniqueLanguagesCount * 5` | **15 points** | Number of unique programming languages used across public repositories. |
| **Account Age** | `yearsActive * 2` | **10 points** | Years active on GitHub (based on the `created_at` field). |

### 2. Grade and Description Mapping

Based on the final calculated score (0 - 100), the developer is assigned a Grade and a corresponding Description:

* **Grade A+ (Elite Developer):** Score of **80 or higher**
* **Grade A (Professional Developer):** Score between **60 and 79**
* **Grade B (Active Developer):** Score between **40 and 59**
* **Grade C (Intermediate Developer):** Score between **20 and 39**
* **Grade D (Beginner Developer):** Score **under 20**

### 3. How it is Displayed in the API Response

The API response provides both the aggregated summary fields and a granular points breakdown under `additional_insights.scoreBreakdown`:

```json
{
  "success": true,
  "data": {
    "username": "example_user",
    "profile_score": 85,
    "developer_grade": "A+",
    "additional_insights": {
      "scoreBreakdown": {
        "starsScore": 40,
        "followersScore": 10,
        "reposScore": 15,
        "languageScore": 10,
        "ageScore": 10
      },
      "description": "Elite Developer"
    }
  }
}
```

---

## Advanced Enhancements (Added Beyond Basic Requirements)

- **Cloud Valkey/Redis Caching (src/features/github/service.js)**: Integrates `ioredis` with full SSL/TLS support to connect to Aiven Valkey, caching profile results for 1 hour with graceful offline fallbacks.
- **Schema Validation Middleware (src/middleware/validation.middleware.js)**: Uses `zod` to validate GitHub username patterns and block invalid requests before hitting external APIs.
- **API Rate Limiting Middleware (src/app.js)**: Uses `express-rate-limit` to restrict requests to a maximum of 100 requests per 15 minutes per IP, protecting the API from denial-of-service and brute force abuse.
- **Startup Environment Validation (src/utils/envValidation.js)**: Validates all required `.env` variables on startup, terminating early with debugging messages if any are missing.
- **Database Performance Indexes (schema.sql / db.js)**: Optimizes MySQL query performance by adding B-Tree indexes on `profile_score`, `stars_received`, and `followers` fields.
- **Render Keep-Alive Self-Ping (src/utils/keepAlive.js)**: Automatically pings the server instance every 14 minutes using `RENDER_EXTERNAL_URL` to prevent the Render Free Tier instance from spinning down.

---

## Folder Structure

```text
src/
├── config/
│   └── db.js                  # Database connection pool & auto-table creation
├── features/
│   └── github/
│       ├── analysis.js        # Repository aggregation logic
│       ├── constants.js       # Constants (e.g. GitHub API Base URL)
│       ├── controller.js      # Express route handlers
│       ├── model.js           # Database queries
│       ├── routes.js          # API route definitions
│       └── service.js         # External API services orchestration (includes Valkey caching)
├── middleware/
│   ├── error.middleware.js    # Global error handler
│   ├── notFound.middleware.js # 404 handler
│   └── validation.middleware.js # Zod username schema validator
├── utils/
│   ├── apiError.js            # Custom ApiError utility class
│   ├── asyncHandler.js        # Wrapper for async routes
│   ├── envValidation.js       # Startup environment check
│   └── profileScore.js        # Developer grading logic
├── app.js                     # Express app setup (cors, json middleware, rate limiter)
└── server.js                  # Server port listening entrypoint
```

---

## Setup & Installation

### Prerequisite
Ensure you have **Node.js (v18+)** and **MySQL** (local or hosted, e.g. Aiven) installed.

### 1. Clone the project and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your database credentials:
```env
PORT=5000
NODE_ENV=development

DB_HOST=your_mysql_host
DB_PORT=your_mysql_port
DB_USER=avnadmin
DB_PASSWORD=your_mysql_password
DB_NAME=defaultdb

# Required for startup check (used to cache profiles for 1 hour)
REDIS_URL=rediss://default:your_valkey_password@your-valkey-host:port

# Required to prevent GitHub API Rate Limits (60 req/hour limit without token)
GITHUB_TOKEN=your_github_personal_access_token
```

### 3. Start the Server
* **Development Mode (using Nodemon):**
  ```bash
  npm run dev
  ```
* **Production Mode:**
  ```bash
  npm start
  ```

---

## API Endpoints & Documentation

### 1. Root / Welcome Endpoint
* **URL:** `GET /`
* **Response:**
```json
{
  "success": true,
  "message": "Welcome to the GitHub Profile Analyzer API!",
  "endpoints": { ... }
}
```

### 2. Analyze Profile (Creates / Updates Record)
* **URL:** `POST /api/profiles/:username` OR `POST /api/profiles` (with body `{"username": "name"}`)
* **Response:**
```json
{
  "success": true,
  "message": "GitHub profile for user \"google\" analyzed and saved successfully.",
  "data": {
    "id": 1,
    "username": "google",
    "name": "Google",
    "avatar_url": "https://avatars.githubusercontent.com/u/1342004?v=4",
    "html_url": "https://github.com/google",
    "bio": "Google Open Source",
    "public_repos": 2878,
    "followers": 73235,
    "following": 0,
    "location": "United States of America",
    "company": null,
    "blog": "https://opensource.google/",
    "stars_received": 92702,
    "top_languages": "Python, JavaScript, Java",
    "profile_score": 100,
    "developer_grade": "A+",
    "popular_repo": "adk-python",
    "popular_repo_stars": 19898,
    "analyzed_at": "2026-05-28T08:56:47.000Z",
    "additional_insights": {
      "uniqueLanguagesCount": 16,
      "averageRepoSizeKb": 13451,
      "totalOpenIssues": 3488,
      "scoreBreakdown": {
        "starsScore": 40,
        "followersScore": 20,
        "reposScore": 15,
        "languageScore": 15,
        "ageScore": 10
      },
      "description": "Elite Developer"
    }
  }
}
```

### 3. Retrieve All Analyzed Profiles
* **URL:** `GET /api/profiles`
* **Query Parameters (Optional):**
  - `sortBy`: `analyzed_at` | `stars_received` | `followers` | `profile_score` | `public_repos` (Default: `analyzed_at`)
  - `order`: `ASC` | `DESC` (Default: `DESC`)
  - `limit`: `number` (Default: `50`)
* **Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "google",
      "name": "Google",
      "stars_received": 92702,
      "profile_score": 100,
      "developer_grade": "A+"
      // ... (other fields)
    }
  ]
}
```

### 4. Fetch Single Profile Details (From DB)
* **URL:** `GET /api/profiles/:username`
* **Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "google",
    "name": "Google"
    // ... (other fields)
  }
}
```

### 5. Delete Profile Record
* **URL:** `DELETE /api/profiles/:username`
* **Response:**
```json
{
  "success": true,
  "message": "Profile for user \"google\" was deleted successfully."
}
```

---

## Testing with Postman

To test the API endpoints locally or in production, we have provided a pre-configured Postman Collection file in the root of this project: `github_profile_analyzer.postman_collection.json`.

### How to Import and Use the Postman Collection:

1. **Open Postman:**
   - Launch your Postman desktop application or open Postman on your web browser.

2. **Import the Collection:**
   - In the top-left corner of Postman, click the **Import** button.
   - Drag and drop or browse to select the `github_profile_analyzer.postman_collection.json` file from the root of this project.
   - Click **Import** to confirm.

3. **Configure the Base URL Variable:**
   - Once imported, click on the **GitHub Profile Analyzer API** collection in your left sidebar.
   - Go to the **Variables** tab in the main panel.
   - Locate the variable named `baseUrl`.
   - Update the **Current Value** to match your target environment:
     - For local testing: `http://localhost:5000`
     - For production testing: `https://assignment-nodejs-9hmk.onrender.com`
   - Click **Save** (Ctrl+S or Cmd+S) in the top-right corner.

4. **Run the Requests:**
   - Expand the collection folder to view the list of 6 requests:
     - **Welcome / Root** (`GET /`)
     - **Analyze Profile (URL Param)** (`POST /api/profiles/:username`)
     - **Analyze Profile (JSON Body)** (`POST /api/profiles`)
     - **Get All Profiles** (`GET /api/profiles`)
     - **Get Single Profile** (`GET /api/profiles/:username`)
     - **Delete Profile** (`DELETE /api/profiles/:username`)
   - Click on any request, adjust path variables (like `:username`) or JSON request body payload, and click **Send**.
