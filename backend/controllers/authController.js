const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      // Deliberately vague - don't reveal whether the email exists or not
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
}

// GET /api/auth/me - used by the frontend on page refresh to check "am I still logged in"
async function getMe(req, res) {
  res.json(req.user);
}

module.exports = { login, getMe };
