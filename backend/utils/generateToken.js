const jwt = require("jsonwebtoken");

// Tokens last 7 days - after that, the user just has to log in again.
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = generateToken;
