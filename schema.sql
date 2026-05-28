

CREATE TABLE IF NOT EXISTS github_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  html_url VARCHAR(255),
  bio TEXT,
  public_repos INT DEFAULT 0,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
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
