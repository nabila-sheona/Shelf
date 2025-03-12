const express = require("express");
const {
  addComment,
  addReply,
  getCommentsByReview,
  deleteComment,
} = require("../Controller/comment.controller");
const { verifyToken } = require("../middleware/jwt");

const router = express.Router();

router.post("/add", verifyToken, addComment);

router.post("/reply", verifyToken, addReply);

router.get("/review/:reviewId", getCommentsByReview);
router.delete("/delete/:commentId", verifyToken, deleteComment);
module.exports = router;
