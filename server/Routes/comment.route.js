const express = require("express");
const {
  addComment,
  addReply,
  getCommentsByReview,
  deleteComment,
} = require("../Controller/comment.controller");
const { verifyToken } = require("../middleware/jwt");

const router = express.Router();

// Route to add a comment to a review (Protected)
router.post("/add", verifyToken, addComment);

// Route to add a reply to a comment (Protected)
router.post("/reply", verifyToken, addReply);

// Route to get all comments for a review (Public)
router.get("/review/:reviewId", getCommentsByReview);
router.delete("/delete/:commentId", verifyToken, deleteComment);
module.exports = router;
