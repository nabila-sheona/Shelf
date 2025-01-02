const express = require("express");
const {
  register,
  login,
  logout,
  googleLogin,
  githubLogin,
} = require("../Controller/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-login", googleLogin);
router.post("/github-login", githubLogin);
module.exports = router;
