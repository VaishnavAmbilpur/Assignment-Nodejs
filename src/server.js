require("dotenv").config();
require("./utils/envValidation")();
const app = require("./app");
const db = require("./config/db");
const keepAlive = require("./utils/keepAlive");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  keepAlive();
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  server.close(() => process.exit(1));
});
