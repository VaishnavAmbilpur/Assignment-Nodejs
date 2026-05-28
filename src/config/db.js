const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.getConnection()
  .then(async (connection) => {
    console.log("Database connected successfully!");
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS github_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar_url VARCHAR(255),
        html_url VARCHAR(255),
        bio TEXT,
        public_repos INT,
        followers INT,
        following INT,
        location VARCHAR(255),
        company VARCHAR(255),
        blog VARCHAR(255),
        stars_received INT DEFAULT 0,
        top_languages VARCHAR(500),
        profile_score INT DEFAULT 0,
        developer_grade VARCHAR(10) DEFAULT 'D',
        popular_repo VARCHAR(255),
        popular_repo_stars INT DEFAULT 0,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_profile_score (profile_score),
        INDEX idx_stars_received (stars_received),
        INDEX idx_followers (followers)
      );
    `;
    try {
      await connection.query(createTableQuery);
    } catch (tableErr) {
      console.error(tableErr.message);
    } finally {
      connection.release();
    }
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

module.exports = pool;
