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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import CurrentlyReading from "./CurrentlyReading";
// Placeholder hero image (replace with your own later)
import image from "./flowers.jpg";
import image2 from "./flowers.jpg";
import ReadingGoal2 from "./ReadingGoal2";
import ImageWithText from "./ImageWithText";
export default function Home() {
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
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [yearlyGoal, setYearlyGoal] = useState({ goal: 200, progress: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [bookLists, setBookLists] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });

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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  // Fetch recommended books and preferred genres
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
          "http://localhost:4000/books/preferred-books",
          { userId }
        );

        setBooks(booksResponse.data);
        setBookLists(data);
        setPreferredGenres(data.preferredGenres || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch Yearly Goal Data (assumes an API endpoint exists)
  useEffect(() => {
    const fetchYearlyGoal = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4000/users/reading-goal",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setYearlyGoal(data);
      } catch (error) {
        console.error("Error fetching yearly goal:", error);
        // Fallback to dummy data if API call fails
        setYearlyGoal({ goal: 200, progress: 120 });
      }
    };

    fetchYearlyGoal();
  }, []);

  const handleBrowseBooks = () => navigate("/browse");
  const handleSearchBooksByGenre = () => navigate("/search-by-genre");

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FDF7F2",
        overflowX: "hidden",
      }}
    >
      {/* ------------------ HERO SECTION ------------------ */}
      <Box
        sx={{
          width: "100%",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          p: 4,
          backgroundColor: "#F8E4E4",
        }}
      >
        {/* Left Text Section */}
        <Box
          component={motion.div}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mr: { md: 4 },
            mb: { xs: 4, md: 0 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "#8E3A59",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Welcome to SHELF
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6F6F6F",
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Shelf is a platform for readers and book recommendations, helping
            book lovers find, read, organize, rate books, and engage with a
            community of readers.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="contained"
                onClick={handleBrowseBooks}
                sx={{
                  background: "#CE93D8",
                  color: "#fff",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "#BA68C8",
                  },
                }}
              >
                Browse Books
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outlined"
                onClick={handleSearchBooksByGenre}
                sx={{
                  borderColor: "#CE93D8",
                  color: "#CE93D8",
                  fontWeight: "bold",
                  "&:hover": {
                    borderColor: "#BA68C8",
                    color: "#BA68C8",
                  },
                }}
              >
                Search by Genre
              </Button>
            </motion.div>
          </Box>
        </Box>

        {/* Right Image Section (Placeholder) */}
        <Box
          component={motion.div}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <motion.img
            src={image}
            alt="Hero"
            style={{
              width: "90%",
              maxWidth: "400px",
              borderRadius: "10px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </Box>
      </Box>
      {/* ------------------ YEARLY READING GOAL SECTION ------------------ */}
      <Container sx={{ my: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            color: "#8E3A59",
            fontFamily: "'Playfair Display', serif",
            mb: 3,
          }}
        >
          Your This Year's Reading Challenge
        </Typography>
        <ReadingGoal2 />
      </Container>
      {/* --- ANOTHER HERO SECTION --- */}

      <Box
        sx={{
          width: "100%",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          backgroundColor: "#F8E4E4",
          p: 4,
          position: "relative", // Needed for absolute positioning inside
          overflow: "hidden",
        }}
      >
        {/* Text container with a higher z-index */}
        <motion.div
          style={{ zIndex: 1 }} // Ensure text is on top of the image
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "#8E3A59",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Discover. Read. Engage.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6F6F6F",
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.6,
              maxWidth: "600px",
              mt: 2,
            }}
          >
            Shelf is your personal reading companion. Organize your books, track
            progress, and connect with a community of passionate readers.
          </Typography>
        </motion.div>
      </Box>

      {/* ------------------ PREFERRED GENRES SECTION ------------------ */}
      <Container sx={{ mb: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {preferredGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{ textAlign: "center", marginBottom: "30px" }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#CE93D8",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Your Preferred Genres
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: "#666",
              }}
            >
              {preferredGenres.join(", ")}
            </Typography>
          </motion.div>
        )}
      </Container>
      {/* ------------------ RECOMMENDATION SECTION ------------------ */}
      <Container
        sx={{
          width: "90%",
          maxWidth: "1200px",
          mb: 6,
          p: 2,
          backgroundColor: "#FFF9F9",
          borderRadius: "10px",
        }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#8E3A59",
              mb: 3,
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Your Recommendations
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {loading ? (
            <Typography>Loading books...</Typography>
          ) : books.length > 0 ? (
            books.map((book, index) => {
              // Rotating colors for variety
              const shelfColors = ["#F8E4E4", "#FCE4EC", "#FFD9E8", "#FFF5F7"];
              const cardColor = shelfColors[index % shelfColors.length];

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        background: cardColor,
                        borderRadius: "15px",
                        cursor: "pointer",
                        height: 180,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: 3,
                        p: 2,
                      }}
                      onClick={() => handleBookClick(book._id)}
                    >
                      <CardContent
                        sx={{ textAlign: "center", overflow: "hidden" }}
                      >
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
                          {book.name}
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
                </Grid>
              );
            })
          ) : (
            <Typography>No books available</Typography>
          )}
        </Grid>
      </Container>

      {/* ------------------ CURRENTLY READING  SECTION ------------------ */}

      <Container sx={{ my: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#8E3A59", mb: 2 }}
        >
          Currently Reading
        </Typography>
        <CurrentlyReading />
      </Container>
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
        {/* --- STATS SECTION --- */}
        <Container
          sx={{
            mt: 6,
            mb: 6,
            p: 4,
            textAlign: "center",
            backgroundColor: "#F8E4E4",
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              color: "#8E3A59",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "bold",
            }}
          >
            Our Community in Numbers
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Typography
                variant="h5"
                sx={{ color: "#8E3A59", fontWeight: "bold", mb: 1 }}
              >
                10k+
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Active Users
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="h5"
                sx={{ color: "#8E3A59", fontWeight: "bold", mb: 1 }}
              >
                100k+
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Books Reviewed
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="h5"
                sx={{ color: "#8E3A59", fontWeight: "bold", mb: 1 }}
              >
                50k+
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Reading Goals Set
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </motion.div>
      {/* ------------------ OBJECTIVE & FEATURES SECTION ------------------ */}
      <Container
        sx={{
          mt: 6,
          mb: 6,
          p: 4,
          backgroundColor: "#FFF9F9",
          borderRadius: "10px",
        }}
      >
        <Grid container spacing={4}>
          {[
            {
              title: "📖 Discover Books",
              description:
                "Personalized recommendations by genre, popularity, and theme tags.",
            },
            {
              title: "⭐ Rate & Review",
              description:
                "Share and edit book ratings, attach media, and engage with the community.",
            },
            {
              title: "📚 Shelf System",
              description:
                "Organize books into Want to Read, Currently Reading, and Read shelves.",
            },
            {
              title: "🎯 Annual Goal & Trackers",
              description:
                "Set an annual reading goal and track your progress privately.",
            },
            {
              title: "📊 Monthly Reports",
              description:
                "See books read, genres explored, and progress tracked per month.",
            },
            {
              title: "📅 Yearly Reports",
              description:
                "Review yearly reading stats, including books completed and reading trends.",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backgroundColor: "#FCE4EC",
                  borderRadius: "15px",
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#8E3A59", mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* ------------------ FOOTER ------------------ */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#F8E4E4",
          py: 4,
          mt: "auto",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#8E3A59",
            fontWeight: "bold",
            fontFamily: "'Playfair Display', serif",
            mb: 1,
          }}
        >
          Bookworms Second Home
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#6F6F6F",
            fontFamily: "'Poppins', sans-serif",
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Explore more features like user reviews, advanced preferences, and a
          thriving reading community. Your journey starts here.
        </Typography>
      </Box>
    </motion.div>
  );
}
