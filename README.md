# GitHub Profile Analyzer API 🚀

An elegant and robust Node.js & Express REST API that analyzes GitHub user profiles using the GitHub Public API, calculates developer insights (scores, grades, popular repos, and top languages), and stores the insights in a MySQL database.

---

## 🌟 Key Features

1. **GitHub Profile Fetching**: Fetches public profile details (bio, followers, company, etc.) in real-time.
2. **Aggregated Repository Insights**:
   - **Total Stars Received**: Sum of stars across all public repositories.
   - **Top Languages**: Determines the top 3 most used languages.
   - **Popular Repository**: Automatically identifies the user's most starred repository.
3. **Developer Scoring & Grading Algorithm**: Calculates a score from `0` to `100` and assigns a grade (`A+`, `A`, `B`, `C`, `D`):
   - **Stars (Max 40pts)**: 5 pts per star.
   - **Followers (Max 20pts)**: 2 pts per follower.
   - **Repositories (Max 15pts)**: 1 pt per repo.
   - **Language Diversity (Max 15pts)**: 5 pts per unique language.
   - **Account Age (Max 10pts)**: 2 pts per year active.
4. **Auto Table Initialization**: Automatically connects to the database and builds the SQL schema if it doesn't exist.
5. **Clean Architecture**: Follows a clean, modular structure (`features/github` folder containing `controller`, `service`, `model`, `routes`, `analysis`, and `constants`).
6. **Robust Error Handling**: Utilizes custom `ApiError` class and global async exception handler middleware.

---

## 📂 Folder Structure

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
│       └── service.js         # External API services orchestration
├── middleware/
│   ├── error.middleware.js    # Global error handler
│   └── notFound.middleware.js # 404 handler
├── utils/
│   ├── apiError.js            # Custom ApiError utility class
│   ├── asyncHandler.js        # Wrapper for async routes
│   └── profileScore.js        # Developer grading logic
├── app.js                     # Express app setup (cors, json middleware)
└── server.js                  # Server port listening entrypoint
```

---

## 🛠️ Setup & Installation

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

# Optional but recommended to prevent GitHub API Rate Limits (60 req/hour limit without token)
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

## 📡 API Endpoints & Documentation

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
