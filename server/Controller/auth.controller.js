const User = require("../Model/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");

const register = async (req, res, next) => {
  try {
    console.log("Received data for registration:", req.body);
    const hash = bcryptjs.hashSync(req.body.password, 5);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    const savedUser = await newUser.save();
    console.log("User saved:", savedUser);
    res.status(201).send("User has been created.");
  } catch (err) {
    console.error("Error during registration:", err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found."));

    const isCorrect = bcryptjs.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username."));

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    // Send token and user data back to the client
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: "true",
    })
    .status(200)
    .send("User has been logged out.");
};

const googleLogin = async (req, res, next) => {
  try {
    const { uid, username, email } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create a new user if not found
      user = new User({
        uid,
        username,
        email,
        preferredGenre: [],
      });
      await user.save();
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

const githubLogin = async (req, res, next) => {
  try {
    const { uid, username, email } = req.body;

    // Find user by 'uid' (for Google users)
    let user = await User.findOne({ uid });

    if (!user) {
      // If not found by 'uid', check by 'email' (in case user registered before)
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create a new user if not found
      user = new User({
        uid, // Set 'uid' for Google users
        username,
        email,
        preferredGenre: [],
      });
      await user.save();
    }

    // Generate token using MongoDB '_id'
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  register,
  login,
  logout,
  googleLogin,
  githubLogin,
};
