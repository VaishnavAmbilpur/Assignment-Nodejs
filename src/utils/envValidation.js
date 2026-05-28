const validateEnv = () => {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "GITHUB_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL SETUP ERROR: Missing required environment variables:");
    missing.forEach((variable) => console.error(`   - ${variable}`));
    console.error("\nPlease check your .env file before starting the server.\n");
    process.exit(1);
  }
};

module.exports = validateEnv;
