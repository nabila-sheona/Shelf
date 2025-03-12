const express = require("express");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("File must be an image or video!"), false);
  }
};
const {
  addOrUpdateReview,
  getReviewsByBook,
  getUserReview,
} = require("../Controller/review.controller");
const { verifyToken } = require("../middleware/jwt");
const router = express.Router();
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post("/submit", verifyToken, upload.single("image"), addOrUpdateReview);

router.get("/book/:bookId", getReviewsByBook);

router.get("/user-review", verifyToken, getUserReview);

module.exports = router;
