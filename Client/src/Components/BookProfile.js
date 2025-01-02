// src/components/BookProfile.js

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import StarRating from "./StarRating";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Internal ReviewsList Component
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

// Internal ReviewItem Component
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
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Failed to add comment.");
      }
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
          reviewId: review._id, // Ensure reviewId is included
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
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Failed to add reply.");
      }
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

export default function BookProfile() {
  const location = useLocation();
  const { book } = location.state || {};

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // States for reviews
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You need to be logged in to view this page.");
          setLoading(false);
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // Fetch user profile and book lists concurrently
        const [profileRes, booksRes] = await Promise.all([
          axios.get("http://localhost:4000/users/profile", config),
          axios.get("http://localhost:4000/users/books", config),
        ]);

        const userData = profileRes.data;
        setUser(userData);

        const { wantToRead, reading, read } = booksRes.data;

        // Debugging: Log the fetched book lists
        console.log("Want to Read:", wantToRead);
        console.log("Reading:", reading);
        console.log("Read:", read);
        console.log("Current Book:", book);

        // Determine the current status of the book with enhanced checks
        if (
          wantToRead.some(
            (item) =>
              item.bookId && item.bookId._id?.toString() === book._id.toString()
          )
        ) {
          setStatus("Want to Read");
        } else if (
          reading.some(
            (item) =>
              item.bookId && item.bookId._id?.toString() === book._id.toString()
          )
        ) {
          setStatus("Reading");
        } else if (
          read.some(
            (item) =>
              item.bookId && item.bookId._id?.toString() === book._id.toString()
          )
        ) {
          setStatus("Read");
        } else {
          setStatus(null);
        }

        // Fetch all reviews for the book
        const reviewsResponse = await axios.get(
          `http://localhost:4000/reviews/book/${book._id}`
        );
        setReviews(reviewsResponse.data);

        // Fetch the current user's review if it exists
        try {
          const userReviewResponse = await axios.get(
            `http://localhost:4000/reviews/user-review`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { bookId: book._id },
            }
          );
          setUserReview(userReviewResponse.data);
          setRating(userReviewResponse.data.rating);
          setReviewText(userReviewResponse.data.review);
        } catch (reviewError) {
          if (reviewError.response && reviewError.response.status === 404) {
            // User has not reviewed the book yet
            setUserReview(null);
          } else {
            console.error("Error fetching user review:", reviewError);
            toast.error("Failed to fetch your review. Please try again later.");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (book) {
      fetchData();
    }
  }, [book]);

  // Handle updating the reading status in the backend
  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to perform this action.");
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const endpoint = `http://localhost:4000/users/update-status/${newStatus
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

      const response = await axios.post(
        endpoint,
        {
          bookId: book._id,
          bookName: book.name,
        },
        config
      );

      // Handle JSON response
      if (response.data && response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success(`Status updated to "${newStatus}"`);
      }

      // If the new status is "Read" and the user hasn't reviewed the book yet, prompt for review
      if (newStatus === "Read" && !userReview) {
        setIsEditing(true);
        toast.info("Please rate and review the book.");
      }

      // Refresh user data to get updated readCount and lists
      const [profileRes, booksRes] = await Promise.all([
        axios.get("http://localhost:4000/users/profile", config),
        axios.get("http://localhost:4000/users/books", config),
      ]);

      const userData = profileRes.data;
      setUser(userData);

      const { wantToRead, reading, read } = booksRes.data;

      // Debugging: Log the refreshed book lists
      console.log("Refreshed Want to Read:", wantToRead);
      console.log("Refreshed Reading:", reading);
      console.log("Refreshed Read:", read);

      // Determine the current status of the book with enhanced checks
      if (
        wantToRead.some(
          (item) =>
            item.bookId && item.bookId._id?.toString() === book._id.toString()
        )
      ) {
        setStatus("Want to Read");
      } else if (
        reading.some(
          (item) =>
            item.bookId && item.bookId._id?.toString() === book._id.toString()
        )
      ) {
        setStatus("Reading");
      } else if (
        read.some(
          (item) =>
            item.bookId && item.bookId._id?.toString() === book._id.toString()
        )
      ) {
        setStatus("Read");
      } else {
        setStatus(null);
      }
    } catch (error) {
      console.error("Error updating reading status:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Failed to update status. Please try again.");
      }
    }
  };

  // Handle submitting a new review or updating an existing one
  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.warn("Please provide a rating between 1 and 5 stars.");
      return;
    }
    if (!reviewText.trim()) {
      toast.warn("Please enter a review.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to submit a review.");
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Ensure the book object has necessary fields
      if (!book._id || !book.name) {
        console.error("Book ID or name is missing.");
        toast.error("Book data is incomplete. Please try again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/reviews/submit",
        {
          bookId: book._id,
          rating,
          review: reviewText,
        },
        config
      );

      console.log("Review Submit Response:", response.data); // Debugging

      if (response.data && response.data.message) {
        if (isEditing) {
          toast.success("Review updated successfully.");
        } else {
          toast.success("Review submitted successfully.");
        }
      } else {
        toast.error("Failed to submit review. Please try again.");
        return; // Exit early since response is not as expected
      }

      // Refresh reviews
      const reviewsResponse = await axios.get(
        `http://localhost:4000/reviews/book/${book._id}`
      );
      setReviews(reviewsResponse.data);

      // Refresh user profile
      const profileRes = await axios.get(
        "http://localhost:4000/users/profile",
        config
      );
      const userData = profileRes.data;
      setUser(userData);
    } catch (error) {
      console.error("Error submitting review:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    if (userReview) {
      setIsEditing(true);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review);
    } else {
      setRating(0);
      setReviewText("");
    }
    setIsEditing(false);
  };

  if (!book) {
    return <p>Book not found</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{book.name}</h1>
      <p>Author: {book.author}</p>
      <p>Genres: {book.genre.join(", ")}</p>
      <p>
        Average Rating: {book.averageRating} ({book.numberOfRatings} ratings)
      </p>

      {/* Buttons for reading status */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => handleStatusChange("Want to Read")}
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            backgroundColor: status === "Want to Read" ? "#4caf50" : "#f0f0f0",
            color: status === "Want to Read" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Want to Read
        </button>
        <button
          onClick={() => handleStatusChange("Reading")}
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            backgroundColor: status === "Reading" ? "#2196f3" : "#f0f0f0",
            color: status === "Reading" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reading
        </button>
        <button
          onClick={() => handleStatusChange("Read")}
          style={{
            padding: "10px 15px",
            backgroundColor: status === "Read" ? "#ff9800" : "#f0f0f0",
            color: status === "Read" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Read
        </button>
      </div>

      {/* Display current status */}
      {status && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          Current status: {status}
        </p>
      )}

      {/* Display total books read */}
      {user && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Total Books Read: {user.readCount}
        </p>
      )}

      {/* Review Section */}
      <div style={{ marginTop: "30px" }}>
        <h2>Reviews</h2>
        <p>
          Average Rating: {book.averageRating} ({book.numberOfRatings} ratings)
        </p>

        {/* User's Review */}
        {user && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Your Review</h3>
            {!userReview && !isEditing ? (
              // If the user hasn't reviewed yet and is not editing, show the review form
              <>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  editable={true}
                />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  cols="50"
                  placeholder="Write your review here..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                ></textarea>
                <div style={{ marginTop: "10px" }}>
                  <button onClick={handleSubmitReview} style={buttonStyle}>
                    Submit Review
                  </button>
                </div>
              </>
            ) : isEditing ? (
              <>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  editable={true}
                />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  cols="50"
                  placeholder="Write your review here..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                ></textarea>
                <div style={{ marginTop: "10px" }}>
                  <button onClick={handleSubmitReview} style={buttonStyle}>
                    Submit Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      ...buttonStyle,
                      marginLeft: "10px",
                      backgroundColor: "#f44336",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // If not editing and user has a review, display it in read-only mode
              <>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  editable={false}
                />
                <p
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  {reviewText}
                </p>
                <div style={{ marginTop: "10px" }}>
                  <button onClick={handleEdit} style={buttonStyle}>
                    Edit Review
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* All Reviews */}
        <ReviewsList
          reviews={reviews}
          currentUserEmail={user ? user.email : null}
        />
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

// Styles
const buttonStyle = {
  padding: "8px 12px",
  backgroundColor: "#4caf50",
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
