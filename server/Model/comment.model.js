const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    review: { type: Schema.Types.ObjectId, ref: "Review", required: true },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Index to optimize queries for comments and replies
CommentSchema.index({ review: 1, parentComment: 1 });

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
