import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardMedia, Typography } from "@mui/material";
import StarRating from "./StarRating";

const buttonStyle = {
  padding: "8px 12px",
  backgroundColor: "#482880",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const replyButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#2196f3",
  marginTop: "5px",
};

export const ReviewsList = ({ reviews, currentUserEmail }) => {
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
      const res = await axios.get(
        `http://localhost:4000/comments/review/${review._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status === 200) {
        setComments(res.data);
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
      const res = await axios.post(
        "http://localhost:4000/comments/add",
        {
          reviewId: review._id,
          content: newComment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 201) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
        toast.success("Comment added successfully.");
      } else {
        alert(res.data.message || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!newReply.trim()) {
      alert("Please enter a reply.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/comments/reply",
        {
          reviewId: review._id,
          parentCommentId,
          content: newReply,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 201) {
        // Update the comments state to include the new reply
        const updatedComments = comments.map((comment) => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [res.data.reply, ...comment.replies],
            };
          }
          return comment;
        });
        setComments(updatedComments);
        setNewReply("");
        setReplyCommentId(null);
        toast.success("Reply added successfully.");
      } else {
        alert(res.data.message || "Failed to add reply.");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      alert(error.response?.data?.message || "Failed to add reply.");
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyCommentId(commentId);
  };

  return (
    <Card
      style={{
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor:
          review.userEmail === currentUserEmail ? "#F48FB1" : "#FFC5D2",
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {review.userEmail}
      </Typography>
      <StarRating rating={review.rating} editable={false} />
      <p>{review.review}</p>
      <p style={{ fontSize: "12px", color: "#555" }}>
        {new Date(review.createdAt).toLocaleString()}
      </p>
      {review.filename &&
        (review.filename.includes("/video/") ? (
          <video
            controls
            width="320"
            height="240"
            style={{
              marginTop: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <source src={review.filename} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <CardMedia
            component="img"
            height="200"
            image={review.filename}
            alt="Review media"
            sx={{
              width: 120,
              height: 160,
              objectFit: "cover",
              borderRadius: "5px",
              marginTop: 1,
              border: "1px solid #ccc",
            }}
          />
        ))}
      <button onClick={toggleComments} style={buttonStyle}>
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>
      {showComments && (
        <div style={{ marginTop: "15px", paddingLeft: "20px" }}>
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
    </Card>
  );
};

export default ReviewsList;
