const { z } = require("zod");

const validateUsername = (req, res, next) => {
  const schema = z.string()
    .min(1, "Username is required")
    .max(39, "GitHub username cannot exceed 39 characters")
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format");

  const username = req.params.username || req.body.username;
  const result = schema.safeParse(username);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: result.error.issues.map(err => err.message)
    });
  }
  next();
};

module.exports = { validateUsername };
