// middleware/jwt.js
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return next(createError(403, "Token is not valid!"));

    // Set identifier for Google users or regular users
    req.userId = decoded.uid || decoded.id; // Use uid for Google, id for regular
    next();
  });
};

module.exports = { verifyToken };
