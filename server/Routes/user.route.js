const express = require("express");
const {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  getPreferredGenres,
  updateReadingStatus,
  getUserBooks,
} = require("../Controller/user.controller"); // Ensure this path is correct
const { verifyToken } = require("../middleware/jwt"); // Ensure this path is correct

const router = express.Router();

router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", verifyToken, getUser);
router.post("/preferences", verifyToken, savePreferences);
router.get("/profile", verifyToken, getUser);
router.put("/update", verifyToken, updateUser);
router.get("/users/preferences", getPreferredGenres);
router.post("/update-reading-status", verifyToken, updateReadingStatus);
router.get("/books", verifyToken, getUserBooks);
router.post("/update-status/want-to-read", verifyToken, (req, res, next) => {
  req.body.list = "wantToRead";
  updateReadingStatus(req, res, next);
});

router.post("/update-status/reading", verifyToken, (req, res, next) => {
  req.body.list = "reading";
  updateReadingStatus(req, res, next);
});

router.post("/update-status/read", verifyToken, (req, res, next) => {
  req.body.list = "read";
  updateReadingStatus(req, res, next);
});

module.exports = router; // Correct CommonJS export
