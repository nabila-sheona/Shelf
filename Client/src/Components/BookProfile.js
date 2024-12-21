import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Hook to get state from navigation
import axios from "axios"; // Import axios for API calls

export default function BookProfile() {
  const location = useLocation(); // Access state passed via navigate
  const { book } = location.state || {}; // Get the book data from state

  const [status, setStatus] = useState(null); // Track reading status
  const [loading, setLoading] = useState(true); // Track loading state
  const [user, setUser] = useState(null); // Store user data

  // Ensure that the useEffect hook is always called
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4000/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(data); // Set the user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means it only runs once when the component mounts

  // If there's no book, return early
  if (!book) {
    return <p>Book not found</p>;
  }

  // Loading state handling
  if (loading) {
    return <p>Loading...</p>;
  }

  // Handle updating the reading status in the backend
  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = `http://localhost:4000/users/update-status/${newStatus
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

      // Ensure that `bookName` is available; assuming `book` has `name` property
      await axios.post(
        endpoint,
        {
          bookId: book._id, // Pass the book ID
          bookName: book.name, // Pass the book Name as well
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus(newStatus); // Update status locally
    } catch (error) {
      console.error("Error updating reading status:", error);
    }
  };

  return (
    <div>
      <h1>{book.name}</h1>
      <p>Author: {book.author}</p>
      <p>Genres: {book.genre.join(", ")}</p>
      <p>
        Rating: {book.rate} ({book.numberOfRatings} ratings)
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
    </div>
  );
}
