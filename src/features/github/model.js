const db = require("../../config/db");

class GitHubProfileModel {
  static async saveProfile(data) {
    const query = `
      INSERT INTO github_profiles (
        username, name, avatar_url, html_url, bio, public_repos, followers, following, 
        location, company, blog, stars_received, top_languages, profile_score, 
        developer_grade, popular_repo, popular_repo_stars
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        avatar_url = VALUES(avatar_url),
        html_url = VALUES(html_url),
        bio = VALUES(bio),
        public_repos = VALUES(public_repos),
        followers = VALUES(followers),
        following = VALUES(following),
        location = VALUES(location),
        company = VALUES(company),
        blog = VALUES(blog),
        stars_received = VALUES(stars_received),
        top_languages = VALUES(top_languages),
        profile_score = VALUES(profile_score),
        developer_grade = VALUES(developer_grade),
        popular_repo = VALUES(popular_repo),
        popular_repo_stars = VALUES(popular_repo_stars);
    `;

    const values = [
      data.username,
      data.name,
      data.avatar_url,
      data.html_url,
      data.bio,
      data.public_repos,
      data.followers,
      data.following,
      data.location,
      data.company,
      data.blog,
      data.stars_received,
      data.top_languages,
      data.profile_score,
      data.developer_grade,
      data.popular_repo,
      data.popular_repo_stars,
    ];

    await db.query(query, values);
    return this.getByUsername(data.username);
  }

  static async getAll({ sortBy = "analyzed_at", order = "DESC", limit = 50 }) {
    const allowedSortFields = ["analyzed_at", "public_repos", "followers", "stars_received", "profile_score", "username"];
    const allowedOrder = ["ASC", "DESC"];

    const sanitizeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "analyzed_at";
    const sanitizeOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";
    const sanitizeLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 50;

    const query = `SELECT * FROM github_profiles ORDER BY ${sanitizeSortBy} ${sanitizeOrder} LIMIT ?`;
    const [rows] = await db.query(query, [sanitizeLimit]);
    return rows;
  }

  static async getByUsername(username) {
    const query = "SELECT * FROM github_profiles WHERE username = ?";
    const [rows] = await db.query(query, [username]);
    return rows[0] || null;
  }

  static async deleteByUsername(username) {
    const query = "DELETE FROM github_profiles WHERE username = ?";
    const [result] = await db.query(query, [username]);
    return result.affectedRows > 0;
  }
}

module.exports = GitHubProfileModel;
