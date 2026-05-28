const express = require("express");
const cors = require("cors");
const githubRoutes = require("./features/github/routes");
const notFoundMiddleware = require("./middleware/notFound.middleware");
const errorMiddleware = require("./middleware/error.middleware");
const rateLimit = require("express-rate-limit");
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(cors());
app.use(express.json());

app.use("/api/profiles", githubRoutes);

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the GitHub Profile Analyzer API!",
    endpoints: {
      analyze_profile_body: {
        method: "POST",
        path: "/api/profiles",
        body: { username: "string (required)" },
        description: "Analyze GitHub profile and store insights.",
      },
      analyze_profile_url: {
        method: "POST",
        path: "/api/profiles/:username",
        description: "Analyze GitHub profile by URL parameter and store insights.",
      },
      get_all_profiles: {
        method: "GET",
        path: "/api/profiles",
        query_params: {
          sortBy: "analyzed_at | stars_received | followers | profile_score | public_repos | username",
          order: "ASC | DESC",
          limit: "number",
        },
        description: "Get all analyzed profile records.",
      },
      get_single_profile: {
        method: "GET",
        path: "/api/profiles/:username",
        description: "Get details of an analyzed profile by username.",
      },
      delete_profile: {
        method: "DELETE",
        path: "/api/profiles/:username",
        description: "Delete an analyzed profile record from database.",
      },
    },
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
