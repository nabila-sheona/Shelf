import React, { useEffect, useState } from "react";
import { Typography, Container, Card, CardContent, Box } from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function CurrentlyReading() {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchCurrentlyReading = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4000/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentlyReading(data.reading || []);
      } catch (error) {
        console.error("Error fetching currently reading books:", error);
      }
    };

    fetchCurrentlyReading();
  }, []);

  // Handle the click to navigate to the book details page
  const handleBookClick = async (bookId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/books/getBookProfile",
        { id: bookId }
      );
      navigate("/bookprofile", { state: { book: response.data } });
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  return (
    <Container sx={{ my: 4 }}>
      {/* Horizontal Scrolling Container */}
      <Box sx={{ overflowX: "auto", display: "flex", gap: 2, pb: 2 }}>
        {currentlyReading.map((book) => (
          <motion.div
            key={book.bookId}
            initial={{ opacity: 0, x: -100 }} // Initial off-screen position and opacity
            animate={{ opacity: 1, x: 0 }} // Animate to full opacity and reset position
            transition={{ duration: 0.5 }} // Duration of the animation
            onClick={() => handleBookClick(book.bookId)} // Add onClick handler to navigate
          >
            <Card
              sx={{
                background: "#FCE4EC",
                borderRadius: "15px",
                cursor: "pointer",
                boxShadow: 3,
                width: 250,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <CardContent sx={{ textAlign: "center", overflow: "hidden" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#8E3A59",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mb: 1,
                  }}
                >
                  {book.bookName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6D4C41",
                    fontStyle: "italic",
                  }}
                >
                  {book.author}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}
