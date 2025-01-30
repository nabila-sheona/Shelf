import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Container,
  Box,
} from "@mui/material";
import axios from "axios";
import image from "./flowers.jpg";
export default function Home() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferredGenres, setPreferredGenres] = useState([]);

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
        const userId = data._id;

        const booksResponse = await axios.post(
          `http://localhost:4000/books/preferred-books`,
          { userId }
        );

        setBooks(booksResponse.data); // Set books data
        setPreferredGenres(data.preferredGenres || []);
      } catch (error) {
        console.error("Error fetching preferred books or user ID:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBrowseBooks = () => {
    navigate("/browse");
  };

  const handleSearchBooksByGenre = () => {
    navigate("/search-by-genre");
  };

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
      <Typography
        variant="h2"
        sx={{
          color: "#EF9A9A",
          mb: 3,
          fontFamily: "Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        WELCOME TO SHELF
      </Typography>
      <Container
        sx={{
          display: "center",
          position: "center",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <img
          src={image}
          alt="Logo"
          style={{
            marginBottom: "2%",

            cursor: "pointer",
          }}
        />
      </Container>
      {error && <Typography color="error">{error}</Typography>}

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={handleBrowseBooks}
          sx={{
            background: "#F6A5C0",
            color: "white",
            "&:hover": { background: "#F48FB1" },
            mr: 2,
          }}
        >
          Browse Books
        </Button>
        <Button
          variant="contained"
          onClick={handleSearchBooksByGenre}
          sx={{
            background: "#C2EAFC",
            color: "black",
            "&:hover": { background: "#FFC5D2" },
          }}
        >
          Search Books by Genre
        </Button>
      </div>
      <Container
        sx={{
          width: "80%",
          maxWidth: "80%",
          mt: 4,
          backgroundColor: "#FFF9E7",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: 2,
          alignItems: "center",
          position: "center",
        }}
      >
        {preferredGenres.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <Typography variant="h2" sx={{ color: "#CE93D8" }}>
              Your Preferred Genres:
            </Typography>
            <Typography>{preferredGenres.join(", ")}</Typography>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <Typography
            variant="h2"
            sx={{
              color: "#EF9A9A",
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Your Recommendation
          </Typography>
          <Grid container spacing={4}>
            {books.length > 0 ? (
              books.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                  <Card
                    sx={{
                      background: "#FFC5D2",
                      "&:hover": { boxShadow: 6 },
                      borderRadius: "10px",
                      height: "200px",
                    }}
                    onClick={() => handleBookClick(book._id)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#9575cd", // Cream white for text visibility  orangelight: "#ffcdd2",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {book.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography>No books available</Typography>
            )}
          </Grid>
        </div>
      </Container>
    </div>
  );
}
