const jwt = require("jsonwebtoken");

module.exports = async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    const User = require("../models/User");
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found." });

    req.userRole = user.role;
    req.userFullName = user.fullName;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
