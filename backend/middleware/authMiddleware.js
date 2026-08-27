const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reads the "Authorization: Bearer <token>" header, verifies it, and attaches
// the logged-in user to req.user. Every route file wraps its routes with this
// except /api/auth/login and /api/auth/register (the very first admin signup).
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
}

module.exports = { protect };
