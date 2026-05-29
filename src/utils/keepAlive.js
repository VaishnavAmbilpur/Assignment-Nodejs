const axios = require("axios");

const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) {
    console.log("No RENDER_EXTERNAL_URL environment variable found. Self-ping is disabled.");
    return;
  }
  const INTERVAL = 14 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log(`Sending keep-alive ping to ${url}...`);
      await axios.get(url);
      console.log("Keep-alive ping completed successfully.");
    } catch (error) {
      console.error("Keep-alive ping failed:", error.message);
    }
  }, INTERVAL);
};

module.exports = keepAlive;
