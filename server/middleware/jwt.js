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

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token with JWT_SECRET
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Set token expiration time if needed
    });

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken };
