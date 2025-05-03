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
import { motion } from "framer-motion";
import CurrentlyReading from "./CurrentlyReading";
import image from "./flowers.jpg";
import ReadingGoal2 from "./ReadingGoal2";

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

  // Fetch user data, books, goals...
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4000/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentlyReading(data.reading || []);
        setPreferredGenres(data.preferredGenres || []);
        const booksRes = await axios.post(
          "http://localhost:4000/books/preferred-books",
          { userId: data._id }
        );
        setBooks(booksRes.data);
      } catch {
        setError("Failed to fetch profile or books");
      } finally {
        setLoading(false);
      }
    }
    async function fetchGoal() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:4000/users/reading-goal",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setYearlyGoal(data);
      } catch {
        setYearlyGoal({ goal: 200, progress: 120 });
      }
    }
    setLoading(true);
    fetchProfile();
    fetchGoal();
  }, []);

  const handleBrowseBooks = () => navigate("/browse");
  const handleSearchBooksByGenre = () => navigate("/search-by-genre");
  const handleBookClick = async (id) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/books/getBookProfile",
        { id }
      );
      navigate("/bookprofile", { state: { book: data } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      component="div"
      sx={{
        height: "100vh",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* HERO */}
      <Box
        component="section"
        sx={{ scrollSnapAlign: "start", height: "100vh" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#F8E4E4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          {/* Left */}
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
              Shelf is a platform for readers and recommendations—find,
              organize, rate, and connect with your reading community.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="contained"
                  onClick={handleBrowseBooks}
                  sx={{
                    background: "#CE93D8",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": { background: "#BA68C8" },
                  }}
                >
                  Browse Books
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
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
          {/* Right */}
          <Box
            component={motion.div}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            sx={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <motion.img
              src={image}
              alt="Hero"
              style={{
                width: "90%",
                maxWidth: "400px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* YEARLY GOAL */}
      <Box
        component="section"
        sx={{ scrollSnapAlign: "start", height: "100vh" }}
      >
        <Container
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
          <ReadingGoal2 goal={yearlyGoal.goal} progress={yearlyGoal.progress} />
        </Container>
      </Box>

      {/* SECOND HERO */}
      <Box
        component="section"
        sx={{
          scrollSnapAlign: "start",
          height: "100vh",
          backgroundColor: "#F8E4E4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          p: 4,
          boxSizing: "border-box",
        }}
      >
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
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
              mx: "auto",
            }}
          >
            Organize your books, track progress, and connect with passionate
            readers worldwide.
          </Typography>
        </motion.div>
      </Box>

      {/* PREFERRED GENRES */}
      <Box
        component="section"
        sx={{
          scrollSnapAlign: "start",
          minHeight: "100vh",
          p: 4,
          boxSizing: "border-box",
          backgroundColor: "#FFF9F9",
          mb: "25vh",
        }}
      >
        <Container sx={{ textAlign: "center" }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {preferredGenres.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
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
            </>
          )}
        </Container>

        <Container>
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
              books.map((book, idx) => {
                const colors = ["#F8E4E4", "#FCE4EC", "#FFD9E8", "#FFF5F7"];
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          background: colors[idx % colors.length],
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
                            sx={{ color: "#6D4C41", fontStyle: "italic" }}
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
      </Box>

      {/* CURRENTLY READING */}
      <Box
        component="section"
        sx={{
          scrollSnapAlign: "start",
          minHeight: "100vh",
          p: 4,
          boxSizing: "border-box",
          backgroundColor: "#F8E4E4",
        }}
      >
        <Container>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#8E3A59", mb: 2 }}
          >
            Currently Reading
          </Typography>
          <CurrentlyReading books={currentlyReading} />
        </Container>
      </Box>

      {/* STATS */}
      <Box
        component="section"
        sx={{
          scrollSnapAlign: "start",
          minHeight: "100vh",
          p: 4,
          boxSizing: "border-box",
          backgroundColor: "#FFF9F9",

          textAlign: "center",
        }}
      >
        <Container>
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

        <Container>
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
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
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
      </Box>

      {/* FOOTER */}
      <Box
        component="section"
        sx={{
          scrollSnapAlign: "start",
          height: "25vh",
          backgroundColor: "#F8E4E4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          boxSizing: "border-box",
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
            textAlign: "center",
          }}
        >
          Explore more features like user reviews, advanced preferences, and a
          thriving reading community. Your journey starts here.
        </Typography>
      </Box>
    </Box>
  );
}
