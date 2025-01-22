import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const palette = {
  pinkLight: "#F6A5C0",
  pink: "#F48FB1",
  blueLight: "#C2EAFC",
  pinkDark: "#FFC5D2",
  redLight: "#EF9A9A",
  purple: "#CE93D8",
  offWhite: "#FFF9E7",
};

export default function SearchBooksByGenre() {
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!genre) {
      setError("Please enter a genre to search.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/books/search-by-genre?genre=${genre}`
      );
      setBooks(response.data);
      setError("");
    } catch (error) {
      setBooks([]);
      setError("No books found for this genre.");
    }
  };

  const handleBookClick = (book) => {
    navigate("/bookprofile", { state: { book } });
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
        maxWidth="lg"
        sx={{ backgroundColor: palette.offWhite, p: 4, borderRadius: 2 }}
      >
        <Typography
          variant="h3"
          sx={{ color: palette.pink, mb: 4, textAlign: "center" }}
        >
          Search Books by Genre
        </Typography>

        <Box display="flex" justifyContent="center" mb={4}>
          <TextField
            label="Enter Genre"
            variant="outlined"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            sx={{ mr: 2, width: "50%" }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ backgroundColor: palette.pink, color: "white" }}
          >
            Search
          </Button>
        </Box>

        {error && (
          <Typography variant="h6" color="error" align="center" sx={{ mb: 4 }}>
            {error}
          </Typography>
        )}

        {books.length > 0 ? (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
                <Card
                  sx={{ height: "100%", backgroundColor: palette.blueLight }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: palette.purple, cursor: "pointer" }}
                      onClick={() => handleBookClick(book)}
                    >
                      {book.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Author: {book.author}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Genres: {book.genre.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Rating: {book.rate} ({book.numberOfRatings} ratings)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No books available
          </Typography>
        )}
      </Container>
    </div>
  );
}
