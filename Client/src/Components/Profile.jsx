import React, { useState, useEffect } from "react";
import axios from "axios";
import fetchUserProfile from "../utils/fetchUserProfile";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import ReadingGoal from "./ReadingGoal";
import {
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Grid,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Settings } from "@mui/icons-material";
import upload from "../utils/upload.js";
//import fetchUserProfile from "../utils/fetchUserProfile";

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

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [desc, setDesc] = useState("");
  const [message, setMessage] = useState("");
  const [bookLists, setBookLists] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchUserProfile();
        setUser(userData);

        if (userData && userData.desc) {
          setDesc(userData.desc);
        }

        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:4000/users/books", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookLists(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMessage("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
    };

    fetchUser();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setProfileImage(null);
    setImagePreview(""); // Clear preview
    setMessage("");
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate a preview URL
    }
  };

  const handleSettingsSave = async () => {
    try {
      const token = localStorage.getItem("token");

      let imageUrl = user.img;
      if (profileImage) {
        imageUrl = await upload(profileImage); // Upload the new image
      }

      const updateData = {
        img: imageUrl,
      };

      const response = await axios.put(
        "http://localhost:4000/users/updateimg",
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data);
      setMessage("Profile updated successfully.");
      handleSettingsClose();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };
  const aggregateGenres = (books) => {
    const genreCounts = {};

    books.forEach((book) => {
      if (book.bookId && book.bookId.genre) {
        if (Array.isArray(book.bookId.genre)) {
          book.bookId.genre.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        } else {
          genreCounts[book.bookId.genre] =
            (genreCounts[book.bookId.genre] || 0) + 1;
        }
      }
    });

    return genreCounts;
  };

  const generateReportData = () => {
    const { read } = bookLists;

    let filteredBooks = [];
    if (reportType === "monthly") {
      const currentMonth = moment().month();
      const currentYear = moment().year();
      filteredBooks = read.filter((book) => {
        const bookMonth = moment(book.readDate).month();
        const bookYear = moment(book.readDate).year();
        return bookMonth === currentMonth && bookYear === currentYear;
      });
    } else if (reportType === "yearly") {
      const currentYear = moment().year();
      filteredBooks = read.filter((book) => {
        const bookYear = moment(book.readDate).year();
        return bookYear === currentYear;
      });
    }

    const genreCounts = aggregateGenres(filteredBooks);

    const totalBooks = filteredBooks.length;
    const genres = Object.keys(genreCounts);
    const genreData = genres.map((genre) => ({
      genre,
      count: genreCounts[genre],
    }));

    const wantToReadCount = bookLists.wantToRead.length;
    const readingCount = bookLists.reading.length;
    const readCount = bookLists.read.length;

    return {
      totalBooks,
      genreData,
      readList: filteredBooks,
      wantToReadCount,
      readingCount,
      readCount,
    };
  };

  const handleGenerateReport = () => {
    const data = generateReportData();
    setReportData(data);
    setIsPaneOpen(true);
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    const title =
      reportType === "monthly"
        ? `Monthly Report - ${moment().format("MMMM YYYY")}`
        : `Yearly Report - ${moment().format("YYYY")}`;
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(12);
    doc.text(`Total Books Read: ${reportData.totalBooks}`, 14, 30);

    const tableColumn = ["Genre", "Number of Books"];
    const tableRows = [];

    reportData.genreData.forEach((genre) => {
      const genreRow = [genre.genre, genre.count];
      tableRows.push(genreRow);
    });

    doc.autoTable({
      startY: 35,
      head: [tableColumn],
      body: tableRows,
    });

    if (reportType === "yearly" && reportData.readList.length > 0) {
      let finalY = doc.previousAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Books Read:", 14, finalY);
      finalY += 7;

      doc.setFontSize(12);
      reportData.readList.forEach((book, index) => {
        const date = moment(book.readDate).format("MMMM DD, YYYY");
        const genres =
          book.bookId && book.bookId.genre
            ? Array.isArray(book.bookId.genre)
              ? book.bookId.genre.join(", ")
              : book.bookId.genre
            : "No Genre";
        const bookName = book.bookId ? book.bookId.name : "Unknown Book";
        doc.text(
          `${index + 1}. ${bookName} - ${genres} (Read on: ${date})`,
          14,
          finalY
        );
        finalY += 7;
      });
    }

    doc.setFontSize(12);
    doc.text(
      `Want to Read: ${reportData.wantToReadCount}`,
      14,
      doc.previousAutoTable.finalY + 10
    );
    doc.text(
      `Currently Reading: ${reportData.readingCount}`,
      14,
      doc.previousAutoTable.finalY + 17
    );
    doc.text(
      `Read: ${reportData.readCount}`,
      14,
      doc.previousAutoTable.finalY + 24
    );

    const filename =
      reportType === "monthly"
        ? `${user.username}_${moment().format("MMMM_YYYY")}.pdf`
        : `${user.username}_${moment().format("YYYY")}.pdf`;

    doc.save(filename);
  };

  const handlePatchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = user._id || "";

      if (!userId) {
        setMessage("User not loaded yet. Cannot patch.");
        return;
      }

      const { data } = await axios.patch(
        `http://localhost:4000/users/${userId}/patch`,
        { desc },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(data);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error patching profile:", error);
      setMessage("Failed to patch profile. Check console for details.");
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
      <Container maxWidth="md" sx={{ backgroundColor: palette.offWhite, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Profile
        </Typography>
        {message && <Typography color="error">{message}</Typography>}
        {/* Profile Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Avatar
            alt="Profile"
            src={imagePreview || user.img || "/default-pfp.png"} // Use preview if available
            sx={{ width: 135, height: 135, mb: 2 }}
          />
          <Typography variant="h4" fontWeight="bold">
            {user.username || "Your Name"}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user.email}
          </Typography>
          <IconButton
            onClick={handleSettingsOpen}
            sx={{
              mt: 2,
              color: "primary",
              display: "flex",
              alignItems: "center",
              gap: 1, // Gap between the icon and the text
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)", // Enlarge the button on hover for better feedback
                backgroundColor: "transparent", // Removes the default hover background color
              },
              "&:hover .MuiTouchRipple-root": {
                display: "none", // Disables the ripple effect on hover
              },
            }}
          >
            <Settings />
            <Typography variant="body2" color="textSecondary">
              Update Profile
            </Typography>
          </IconButton>
        </Box>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="User Details" />
          <Tab label="Yearly Goals" />
          <Tab label="Book Lists" />
          <Tab label="Description" />
          <Tab label="Report Generation" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ mt: "5%" }}>
            {/* User Details */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              User Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  fullWidth
                  variant="outlined"
                  value={user.username}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  fullWidth
                  variant="outlined"
                  value={user.email}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                {user && (
                  <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                    Total Books Read: {user.readCount}
                  </p>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: "5%" }}>
            <Typography variant="h6">Yearly Goals</Typography>
            <ReadingGoal />
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ mt: "5%" }}>
            {Object.entries(bookLists).map(([listName, books]) => (
              <Card key={listName} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color={palette.pink}>
                    {listName.replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <List>
                    {books.length > 0 ? (
                      books.map((book, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={
                              book.bookId ? book.bookId.name : "Unknown Book"
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>No books in this list.</Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ mt: "5%" }}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={handlePatchProfile}
              variant="contained"
              sx={{ backgroundColor: palette.pinkLight }}
            >
              Update Description
            </Button>
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ mt: "5%" }}>
            <Button
              onClick={() => {
                setReportType("monthly");
                handleGenerateReport();
              }}
              variant="contained"
              sx={{ mr: 2, backgroundColor: palette.blueLight }}
            >
              Generate Monthly Report
            </Button>
            <Button
              onClick={() => {
                setReportType("yearly");
                handleGenerateReport();
              }}
              variant="contained"
              sx={{ backgroundColor: palette.purple }}
            >
              Generate Yearly Report
            </Button>
          </Box>
        )}

        <SlidingPane
          isOpen={isPaneOpen}
          title={reportType === "monthly" ? "Monthly Report" : "Yearly Report"}
          onRequestClose={() => {
            setIsPaneOpen(false);
            setReportData(null);
          }}
          width="50%"
        >
          {reportData ? (
            <Box>
              <Typography variant="h6">
                {reportType === "monthly"
                  ? `Report for ${moment().format("MMMM YYYY")}`
                  : `Report for ${moment().format("YYYY")}`}
              </Typography>
              <Typography>Total Books Read: {reportData.totalBooks}</Typography>
              <Typography variant="subtitle1">Genres Read:</Typography>
              <List>
                {reportData.genreData.length > 0 ? (
                  reportData.genreData.map((genre) => (
                    <ListItem key={genre.genre}>
                      <ListItemText
                        primary={`${genre.genre}: ${genre.count}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No genres to display.</Typography>
                )}
              </List>
              <Button
                onClick={downloadPDF}
                variant="contained"
                sx={{ mt: 3, backgroundColor: palette.redLight }}
              >
                Download as PDF
              </Button>
            </Box>
          ) : (
            <Typography>Generating report...</Typography>
          )}
        </SlidingPane>
        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={handleSettingsClose}>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogContent>
            {message && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}
            <Button
              variant="outlined"
              component="label"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#121858", // Midnight Blue
                color: "white", // Ensure text color contrasts well
                "&:hover": {
                  backgroundColor: "#0f144d", // Slightly darker shade for hover effect
                },
              }}
            >
              Upload New Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange} // Handle file selection
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSettingsSave} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default Profile;
