const axios = require("axios");
const { GITHUB_API_BASE } = require("./constants");
const { analyzeRepositories } = require("./analysis");
const { calculateProfileScore } = require("../../utils/profileScore");
const ApiError = require("../../utils/apiError");
const Valkey = require("ioredis");
const valkey = new Valkey(process.env.REDIS_URL);

valkey.on("error", (err) => {
  console.error("Valkey Connection Error:", err.message);
});
const getHeaders = () => {
  const headers = {
    "User-Agent": "GitHub-Profile-Analyzer-API",
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "your_github_token") {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

class GitHubService {
  static async analyzeProfile(username) {
    const cacheKey = `github:profile:${username.toLowerCase()}`;
    try {
      const cached = await valkey.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      console.warn("Valkey read failed, querying GitHub directly:", cacheErr.message);
    }
    try {
      let profileResponse;
      try {
        profileResponse = await axios.get(`${GITHUB_API_BASE}/users/${username}`, {
          headers: getHeaders(),
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          throw new ApiError(404, `GitHub user "${username}" not found.`);
        }
        throw new ApiError(
          err.response?.status || 500,
          `Failed to fetch GitHub profile: ${err.message}`
        );
      }

      const profileData = profileResponse.data;

      const reposResponse = await axios.get(
        `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&type=owner`,
        { headers: getHeaders() }
      );
      const repos = reposResponse.data || [];

      const repoInsights = analyzeRepositories(repos);

      const scoreInsights = calculateProfileScore(
        profileData,
        repoInsights.starsReceived,
        repoInsights.uniqueLanguagesCount
      );

      const formattedData = {
        username: profileData.login,
        name: profileData.name || null,
        avatar_url: profileData.avatar_url || null,
        html_url: profileData.html_url || null,
        bio: profileData.bio || null,
        public_repos: profileData.public_repos || 0,
        followers: profileData.followers || 0,
        following: profileData.following || 0,
        location: profileData.location || null,
        company: profileData.company || null,
        blog: profileData.blog || null,
        stars_received: repoInsights.starsReceived,
        top_languages: repoInsights.topLanguages,
        profile_score: scoreInsights.score,
        developer_grade: scoreInsights.grade,
        popular_repo: repoInsights.popularRepoName,
        popular_repo_stars: repoInsights.popularRepoStars,
        additional_insights: {
          uniqueLanguagesCount: repoInsights.uniqueLanguagesCount,
          averageRepoSizeKb: repoInsights.avgRepoSize,
          totalOpenIssues: repoInsights.totalOpenIssues,
          scoreBreakdown: scoreInsights.breakdown,
          description: scoreInsights.description,
        },
      };
      try {
      await valkey.set(cacheKey, JSON.stringify(formattedData), "EX", 3600);
      } catch (cacheErr) {
      console.warn("Failed to write to Valkey cache:", cacheErr.message);
      }
      return formattedData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error occurred during GitHub service analysis: ${error.message}`);
    }
  }
}

module.exports = GitHubService;
