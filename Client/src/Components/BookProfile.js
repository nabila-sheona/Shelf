import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import StarRating from "./StarRating";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { ReviewsList } from "./ReviewsList";

const palette = {
  green: "#4caf50",
  blue: "#2196f3",
  orange: "#ff9800",
  lightGray: "#f0f0f0",
  gray: "#ccc",
  pinkLight: "#F6A5C0",
  pink: "#F48FB1",
  blueLight: "#C2EAFC",
  pinkDark: "#FFC5D2",
  redLight: "#EF9A9A",
  purple: "#CE93D8",
  offWhite: "#FFF9E7",
  violet: "#482880",
};

export default function BookProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const location = useLocation();
  const { book } = location.state || {};
  const [picture, setPicture] = useState(null);
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState(false);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // States for reviews
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // New states for review image upload
  const [reviewPicture, setReviewPicture] = useState(null);
  const [reviewFileName, setReviewFileName] = useState("");

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setPicture(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // New file change handler for review image upload
  const handleReviewFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setReviewPicture(selectedFile);
      setReviewFileName(selectedFile.name);
    }
  };

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
      // Ensure the book object has necessary fields
      if (!book._id || !book.name) {
        console.error("Book ID or name is missing.");
        toast.error("Book data is incomplete. Please try again.");
        return;
      }

      // Use FormData to allow file upload for review images
      const formData = new FormData();
      formData.append("bookId", book._id);
      formData.append("rating", rating);
      formData.append("review", reviewText);
      if (reviewPicture) {
        formData.append("image", reviewPicture);
      }

      // Post to the correct reviews endpoint using axios
      const response = await axios.post(
        "http://localhost:4000/reviews/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
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
        return;
      }

      // Refresh reviews
      const reviewsResponse = await axios.get(
        `http://localhost:4000/reviews/book/${book._id}`
      );
      setReviews(reviewsResponse.data);

      // Refresh user profile
      const profileRes = await axios.get(
        "http://localhost:4000/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = profileRes.data;
      setUser(userData);

      // Clear review image after submission
      setReviewPicture(null);
      setReviewFileName("");
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
    setReviewPicture(null);
    setReviewFileName("");
  };

  if (!book) {
    return <p>Book not found</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Container
      maxWidth="100%"
      sx={{ backgroundColor: palette.offWhite, p: 3, borderRadius: 2 }}
    >
      {/* Display Book Image using MUI CardMedia */}
      {book.img && (
        <CardMedia
          component="img"
          height="300"
          image={book.img}
          alt={book.name}
          sx={{ borderRadius: 2, mb: 3 }}
        />
      )}
      <Typography variant="h2" sx={{ color: palette.redLight, mb: 2 }}>
        {book.name}
      </Typography>
      <Typography variant="h6">Author: {book.author}</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Genres: {book.genre.join(", ")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Average Rating: {book.averageRating} ({book.numberOfRatings} ratings)
      </Typography>
      {/* Display current status */}
      {status && (
        <Typography variant="h4" sx={{ color: palette.violet }}>
          Current status: {status}
        </Typography>
      )}
      {/* Buttons for reading status */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <button
          onClick={() => handleStatusChange("Want to Read")}
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            backgroundColor:
              status === "Want to Read" ? palette.redLight : palette.offWhite,
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
            backgroundColor:
              status === "Reading" ? palette.purple : palette.offWhite,
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
            backgroundColor:
              status === "Read" ? palette.violet : palette.offWhite,
            color: status === "Read" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Read
        </button>
      </Box>
      {/* Review Section */}
      <div style={{ marginTop: "30px" }}>
        <Typography variant="h4" sx={{ color: palette.pink }}>
          Reviews
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Average Rating: {book.averageRating} ({book.numberOfRatings} ratings)
        </Typography>
        {/* User's Review */}
        {user && (
          <Card sx={{ mb: 4, p: 3 }}>
            <Typography variant="h5">Your Review</Typography>
            {!userReview || isEditing ? (
              <Box>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  editable={true}
                />
                <TextField
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  label="Write your review here..."
                  multiline
                  rows={4}
                  fullWidth
                  sx={{ mt: 2, mb: 2 }}
                />
                <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                  Upload Image or Video
                  <input
                    type="file"
                    hidden
                    accept="image/*, video/*"
                    onChange={handleReviewFileChange}
                  />
                </Button>
                {reviewFileName && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Selected file: {reviewFileName}
                  </Typography>
                )}
                {/* Preview Section */}
                {(reviewPicture ||
                  (userReview?.filename && !removeExistingMedia)) && (
                  <Box sx={{ mt: 2, position: "relative", maxWidth: "300px" }}>
                    {reviewPicture ? (
                      reviewPicture.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(reviewPicture)}
                          alt="Preview"
                          style={{ width: "100%", borderRadius: "5px" }}
                        />
                      ) : reviewPicture.type.startsWith("video/") ? (
                        <video
                          controls
                          style={{ width: "100%", borderRadius: "5px" }}
                        >
                          <source
                            src={URL.createObjectURL(reviewPicture)}
                            type={reviewPicture.type}
                          />
                          Your browser does not support video.
                        </video>
                      ) : null
                    ) : (
                      // If editing and no new file is selected, show the already uploaded media
                      userReview?.filename &&
                      (userReview.filename.includes("/video/") ? (
                        <video
                          controls
                          style={{ width: "100%", borderRadius: "5px" }}
                        >
                          <source src={userReview.filename} type="video/mp4" />
                          Your browser does not support video.
                        </video>
                      ) : (
                        <img
                          src={userReview.filename}
                          alt="Existing Media"
                          style={{ width: "100%", borderRadius: "5px" }}
                        />
                      ))
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setReviewPicture(null);
                        setReviewFileName("");
                        setRemoveExistingMedia(true);
                      }}
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        backgroundColor: "red",
                        "&:hover": { backgroundColor: "darkred" },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
                {isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        mr: 2,
                        backgroundColor: palette.purple,
                        color: "white",
                      }}
                      onClick={handleSubmitReview}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: palette.blueLight,
                        color: "white",
                      }}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: palette.purple, color: "white" }}
                    onClick={handleSubmitReview}
                  >
                    Submit Review
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                <StarRating
                  rating={rating}
                  setRating={setRating}
                  editable={false}
                />
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                  {reviewText}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: palette.pink, color: "white" }}
                  onClick={handleEdit}
                >
                  Edit Review
                </Button>
              </Box>
            )}
          </Card>
        )}
        {/* All Reviews */}
        <ReviewsList
          reviews={reviews}
          currentUserEmail={user ? user.email : null}
        />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Container>
  );
}
