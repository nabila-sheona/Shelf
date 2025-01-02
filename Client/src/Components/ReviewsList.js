// src/components/ReviewItem.js

import React, { useState } from "react";
import StarRating from "./StarRating";

const ReviewsList = ({ reviews, currentUserEmail }) => {
  return (
    <div>
      {reviews.length === 0 && <p>No reviews yet.</p>}
      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          currentUserEmail={currentUserEmail}
        />
      ))}
    </div>
  );
};

const ReviewItem = ({ review, currentUserEmail }) => {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [newReply, setNewReply] = useState("");

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/comments/review/${review._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/comments/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId: review._id,
          content: newComment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setNewComment("");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!newReply.trim()) {
      alert("Please enter a reply.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/comments/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewId: review._id, // Ensure reviewId is included
          parentCommentId,
          content: newReply,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the comments state to include the new reply
        const updatedComments = comments.map((comment) => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [data.reply, ...comment.replies],
            };
          }
          return comment;
        });
        setComments(updatedComments);
        setNewReply("");
        setReplyCommentId(null);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add reply.");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyCommentId(commentId);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor:
          review.userEmail === currentUserEmail ? "#f9f9f9" : "#fff",
      }}
    >
      <p style={{ fontWeight: "bold" }}>{review.userEmail}</p>
      <StarRating rating={review.rating} editable={false} />
      <p>{review.review}</p>
      <p style={{ fontSize: "12px", color: "#555" }}>
        {new Date(review.createdAt).toLocaleString()}
      </p>

      {/* Toggle Comments */}
      <button onClick={toggleComments} style={buttonStyle}>
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: "15px", paddingLeft: "20px" }}>
          {/* Add a new comment */}
          <div style={{ marginBottom: "10px" }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              cols="50"
              placeholder="Write a comment..."
              style={{ width: "100%", padding: "5px" }}
            ></textarea>
            <button onClick={handleAddComment} style={buttonStyle}>
              Add Comment
            </button>
          </div>

          {/* List of comments */}
          {comments.length === 0 && <p>No comments yet.</p>}
          {comments.map((comment) => (
            <div key={comment._id} style={{ marginBottom: "10px" }}>
              <p style={{ fontWeight: "bold" }}>
                {comment.user.username || comment.userEmail}
              </p>
              <p>{comment.content}</p>
              <p style={{ fontSize: "12px", color: "#555" }}>
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => handleReplyClick(comment._id)}
                style={replyButtonStyle}
              >
                Reply
              </button>

              {/* Reply form */}
              {replyCommentId === comment._id && (
                <div style={{ marginTop: "5px", paddingLeft: "20px" }}>
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows="2"
                    cols="50"
                    placeholder="Write a reply..."
                    style={{ width: "100%", padding: "5px" }}
                  ></textarea>
                  <button
                    onClick={() => handleAddReply(comment._id)}
                    style={buttonStyle}
                  >
                    Add Reply
                  </button>
                </div>
              )}

              {/* List of replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: "10px", paddingLeft: "20px" }}>
                  {comment.replies.map((reply) => (
                    <div key={reply._id} style={{ marginBottom: "5px" }}>
                      <p style={{ fontWeight: "bold" }}>
                        {reply.user.username || reply.userEmail}
                      </p>
                      <p>{reply.content}</p>
                      <p style={{ fontSize: "12px", color: "#555" }}>
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const buttonStyle = {
  padding: "5px 10px",
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
  marginTop: "5px",
};

const replyButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#2196f3",
  marginTop: "5px",
};

export default ReviewsList;
