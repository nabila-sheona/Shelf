const Comment = require("../Model/comment.model");
const Review = require("../Model/review.model");
const User = require("../Model/user.model");
const createError = require("../utils/createError");

const addComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { reviewId, content } = req.body;

    if (!reviewId || !content) {
      return res
        .status(400)
        .json({ message: "Review ID and content are required." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const comment = new Comment({
      user: userId,
      review: reviewId,
      content,
    });

    await comment.save();

    review.comments.push(comment._id);
    await review.save();

    res.status(201).json({ message: "Comment added successfully.", comment });
  } catch (error) {
    next(error);
  }
};

const addReply = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { parentCommentId, content } = req.body;

    if (!parentCommentId || !content) {
      return res
        .status(400)
        .json({ message: "Parent comment ID and content are required." });
    }

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found." });
    }

    const reply = new Comment({
      user: userId,
      review: parentComment.review,
      parentComment: parentCommentId,
      content,
    });

    await reply.save();

    res.status(201).json({ message: "Reply added successfully.", reply });
  } catch (error) {
    next(error);
  }
};

const getCommentsByReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({ message: "Review ID is required." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const comments = await Comment.find({
      review: reviewId,
      parentComment: null,
    })
      .populate("user", "username email")
      .lean();

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("user", "username email")
          .lean();
        return { ...comment, replies };
      })
    );

    res.status(200).json(commentsWithReplies);
  } catch (error) {
    next(error);
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const review = await Review.findById(comment.review);
    if (!review) {
      return res.status(404).json({ message: "Associated review not found." });
    }

    if (comment.userEmail !== user.email && review.userEmail !== user.email) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment." });
    }

    await deleteCommentRecursively(commentId);

    res
      .status(200)
      .json({ message: "Comment and its replies deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    next(error);
  }
};

const deleteCommentRecursively = async (commentId) => {
  const comment = await Comment.findById(commentId);
  if (comment) {
    for (const replyId of comment.replies) {
      await deleteCommentRecursively(replyId);
    }

    await Comment.findByIdAndDelete(commentId);
  }
};

module.exports = {
  addComment,
  addReply,
  getCommentsByReview,
  deleteComment,
};
