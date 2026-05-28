const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { validateUsername } = require("../../middleware/validation.middleware");
router.post("/", validateUsername, controller.analyzeProfile);
router.post("/:username", validateUsername, controller.analyzeProfile);
router.get("/", controller.getAllProfiles);
router.get("/:username", controller.getProfileByUsername);
router.delete("/:username", controller.deleteProfile);

module.exports = router;
