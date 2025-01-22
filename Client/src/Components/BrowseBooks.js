import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
} from "@mui/material";

const palette = {
  pinkLight: "#f6a5c0",
  pink: "#F48FB1",
  blueLight: "#4fc3f7",
  pinkDark: "#FFC5D2",
  redLight: "#EF9A9A",
  purple: "#CE93D8",
  offWhite: "#FFF9E7",
  orangelight: "#ffcdd2",
  violet: "#b39ddb",
};

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:4000/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

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
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FFF9E7",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Container
        maxWidth="100%"
        sx={{ backgroundColor: palette.offWhite, p: 3, borderRadius: 2 }}
      >
        <Container
          maxWidth="100%"
          sx={{ backgroundColor: palette.offWhite, p: 2, borderRadius: 2 }}
        >
          <Typography
            variant="h3"
            sx={{ color: palette.violet, mb: 3, textAlign: "center" }}
          >
            Browse Books
          </Typography>
        </Container>
        <Container
          maxWidth="100%"
          sx={{ backgroundColor: palette.offWhite, p: 3, borderRadius: 2 }}
        >
          {books.length > 0 ? (
            <Grid container spacing={3}>
              {books.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book._id}>
                  <Card
                    sx={{
                      backgroundColor: palette.orangelight,
                      borderRadius: 2,
                      boxShadow: 3,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ color: palette.purple, mb: 2 }}
                      >
                        {book.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                        Author: {book.author}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                        Genres: {book.genre.join(", ")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: palette.redLight, mb: 2 }}
                      >
                        Rating: {book.rate} ({book.numberOfRatings} ratings)
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: palette.blueLight,
                          color: "white",
                        }}
                        onClick={() => handleBookClick(book._id)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
              No books available
            </Typography>
          )}
        </Container>
      </Container>
    </div>
  );
}
