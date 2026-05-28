const GitHubService = require("./service");
const GitHubProfileModel = require("./model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");

const analyzeProfile = asyncHandler(async (req, res) => {
  const username = req.params.username || req.body.username;
  
  if (!username) {
    throw new ApiError(400, "Username is required.");
  }

  const analyzedData = await GitHubService.analyzeProfile(username.trim());
  const savedProfile = await GitHubProfileModel.saveProfile(analyzedData);

  res.status(200).json({
    success: true,
    message: `GitHub profile for user "${username}" analyzed and saved successfully.`,
    data: {
      ...savedProfile,
      additional_insights: analyzedData.additional_insights,
    },
  });
});

const getAllProfiles = asyncHandler(async (req, res) => {
  const { sortBy, order, limit } = req.query;

  const profiles = await GitHubProfileModel.getAll({ sortBy, order, limit });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles,
  });
});

const getProfileByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username parameter is required.");
  }

  const profile = await GitHubProfileModel.getByUsername(username.trim());
  
  if (!profile) {
    throw new ApiError(
      404, 
      `Profile for user "${username}" has not been analyzed yet. Use POST /api/profiles/${username} to analyze it.`
    );
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

const deleteProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username parameter is required.");
  }

  const wasDeleted = await GitHubProfileModel.deleteByUsername(username.trim());

  if (!wasDeleted) {
    throw new ApiError(404, `Profile for user "${username}" was not found in the database.`);
  }

  res.status(200).json({
    success: true,
    message: `Profile for user "${username}" was deleted successfully.`,
  });
});

module.exports = {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
  deleteProfile,
};
