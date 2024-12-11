const express = require("express");
const {
  register,
  login,
  logout,
  googleLogin,
} = require("../Controller/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-login", googleLogin); // New Google login route

module.exports = router;
