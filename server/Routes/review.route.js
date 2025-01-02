// routes/review.routes.js
const express = require("express");
const {
  addOrUpdateReview,
  getReviewsByBook,
  getUserReview,
} = require("../Controller/review.controller");
const { verifyToken } = require("../middleware/jwt");
const router = express.Router();

// Route to add or update a review (Protected)
router.post("/submit", verifyToken, addOrUpdateReview);

// Route to get all reviews for a specific book (Public)
router.get("/book/:bookId", getReviewsByBook);

// Route to get a specific user's review for a book (Protected)
router.get("/user-review", verifyToken, getUserReview);

module.exports = router;
