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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
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
      </Container>
    </div>
  );
};

export default Profile;
