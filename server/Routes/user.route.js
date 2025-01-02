const express = require("express");
const {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  getPreferredGenres,
  updateReadingStatus,
  getUserBooks,
  getBookGenre,
} = require("../Controller/user.controller");
const { verifyToken } = require("../middleware/jwt");

const router = express.Router();

/* =======================
   === Book  Route ===
   ======================= */
router.get("/books/:id/genre", verifyToken, getBookGenre);
router.get("/books", verifyToken, getUserBooks);

/* =======================
   === Update Reading Status Routes ===
   ======================= */
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

/* =======================
   === General User Routes ===
   ======================= */
router.post("/preferences", verifyToken, savePreferences);
router.get("/users/preferences", verifyToken, getPreferredGenres);
router.get("/profile", verifyToken, getUser);
router.get("/:id", verifyToken, getUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/update", verifyToken, updateUser);

module.exports = router;
