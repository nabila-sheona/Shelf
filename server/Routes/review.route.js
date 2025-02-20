// routes/review.routes.js
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
    cb(null, "uploads/"); // Specify where to store the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

// Allow both images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("File must be an image or video!"), false); // Reject other file types
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
// Route to add or update a review (Protected)
router.post(
  "/submit",
  verifyToken,
  upload.single("image"), // Ensure frontend uses "image" as the key
  addOrUpdateReview
);

// Route to get all reviews for a specific book (Public)
router.get("/book/:bookId", getReviewsByBook);

// Route to get a specific user's review for a book (Protected)
router.get("/user-review", verifyToken, getUserReview);

module.exports = router;
