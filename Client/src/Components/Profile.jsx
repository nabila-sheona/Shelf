import React, { useState, useEffect } from "react";
import axios from "axios";
//import "./Profile.scss";
import fetchUserProfile from "../utils/fetchUserProfile";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [message, setMessage] = useState("");
  const [bookLists, setBookLists] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [reportType, setReportType] = useState("monthly"); // 'monthly' or 'yearly'
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Assuming fetchUserProfile fetches and returns user data
        const userData = await fetchUserProfile();
        setUser(userData);

        // Fetch books for the user
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


  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Function to aggregate genres
  const aggregateGenres = (books) => {
    const genreCounts = {};

    books.forEach((book) => {
      console.log("Processing Book:", book); // Debugging
      if (book.bookId && book.bookId.genre) {
        // Handle genre as an array
        if (Array.isArray(book.bookId.genre)) {
          book.bookId.genre.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        } else {
          // Handle genre as a single string
          genreCounts[book.bookId.genre] = (genreCounts[book.bookId.genre] || 0) + 1;
        }
      }
    });

    console.log("Aggregated Genres:", genreCounts); // Debugging
    return genreCounts;
  };

  // Function to generate report data
  const generateReportData = () => {
    const { read } = bookLists;

    // Filter books based on report type
    let filteredBooks = [];
    if (reportType === "monthly") {
      const currentMonth = moment().month(); // 0-indexed
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

    // Aggregate genres
    const genreCounts = aggregateGenres(filteredBooks);

    // Prepare report data
    const totalBooks = filteredBooks.length;
    const genres = Object.keys(genreCounts);
    const genreData = genres.map((genre) => ({
      genre,
      count: genreCounts[genre],
    }));

    // Counts for all lists
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

  // Function to handle report generation
  const handleGenerateReport = () => {
    const data = generateReportData();
    setReportData(data);
    setIsPaneOpen(true);
  };

  // Function to download report as PDF
  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    // Title
    const title =
      reportType === "monthly"
        ? `Monthly Report - ${moment().format("MMMM YYYY")}`
        : `Yearly Report - ${moment().format("YYYY")}`;
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Total Books Read
    doc.setFontSize(12);
    doc.text(`Total Books Read: ${reportData.totalBooks}`, 14, 30);

    // Genre Table
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

    // Optional: Add read list details for yearly report
    if (reportType === "yearly" && reportData.readList.length > 0) {
      let finalY = doc.previousAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Books Read:", 14, finalY);
      finalY += 7;

      doc.setFontSize(12);
      reportData.readList.forEach((book, index) => {
        const date = moment(book.readDate).format("MMMM DD, YYYY");
        const genres = book.bookId && book.bookId.genre
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

    // Counts of all lists
    doc.setFontSize(12);
    doc.text(`Want to Read: ${reportData.wantToReadCount}`, 14, doc.previousAutoTable.finalY + 10);
    doc.text(`Currently Reading: ${reportData.readingCount}`, 14, doc.previousAutoTable.finalY + 17);
    doc.text(`Read: ${reportData.readCount}`, 14, doc.previousAutoTable.finalY + 24);

    // Save the PDF
    const filename =
      reportType === "monthly"
        ? `${user.username}_${moment().format("MMMM_YYYY")}.pdf`
        : `${user.username}_${moment().format("YYYY")}.pdf`;

    doc.save(filename);
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {message && <p className="message">{message}</p>}
      <div className="profile-info">
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <hr />
        <h3>Your Books</h3>

        {/* Want to Read */}
        <div>
          <h4>Want to Read</h4>
          {bookLists.wantToRead.length > 0 ? (
            <ul>
              {bookLists.wantToRead.map((book, index) => (
                <li key={book.bookId ? book.bookId._id : index}>
                  {book.bookId ? book.bookId.name : "Unknown Book"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No books in this list.</p>
          )}
        </div>

        {/* Currently Reading */}
        <div>
          <h4>Currently Reading</h4>
          {bookLists.reading.length > 0 ? (
            <ul>
              {bookLists.reading.map((book, index) => (
                <li key={book.bookId ? book.bookId._id : index}>
                  {book.bookId ? book.bookId.name : "Unknown Book"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No books in this list.</p>
          )}
        </div>

        {/* Read */}
        <div>
          <h4>Read</h4>
          {bookLists.read.length > 0 ? (
            <ul>
              {bookLists.read.map((book, index) => (
                <li key={book.bookId ? book.bookId._id : index}>
                  {book.bookId ? book.bookId.name : "Unknown Book"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No books in this list.</p>
          )}
        </div>
      </div>

      {/* Report Buttons */}
      <div className="report-buttons" style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            setReportType("monthly");
            handleGenerateReport();
          }}
          className="report-button"
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate Monthly Report
        </button>
        <button
          onClick={() => {
            setReportType("yearly");
            handleGenerateReport();
          }}
          className="report-button"
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate Yearly Report
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="logout-button"
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* Sliding Pane for Report */}
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
          <div>
            <h3>
              {reportType === "monthly"
                ? `Report for ${moment().format("MMMM YYYY")}`
                : `Report for ${moment().format("YYYY")}`}
            </h3>
            <p>
              <strong>Total Books Read:</strong> {reportData.totalBooks}
            </p>
            <h4>Genres Read:</h4>
            {reportData.genreData.length > 0 ? (
              <ul>
                {reportData.genreData.map((genre) => (
                  <li key={genre.genre}>
                    {genre.genre}: {genre.count}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No genres to display.</p>
            )}

            {/* Counts for all lists */}
            <h4>List Counts:</h4>
            <ul>
              <li>Want to Read: {reportData.wantToReadCount}</li>
              <li>Currently Reading: {reportData.readingCount}</li>
              <li>Read: {reportData.readCount}</li>
            </ul>

            {/* Optional: Detailed Read List for Yearly Report */}
            {reportType === "yearly" && reportData.readList.length > 0 && (
              <div>
                <h4>Books Read:</h4>
                <ul>
                  {reportData.readList.map((book, index) => (
                    <li key={index}>
                      {book.bookName} -{" "}
                      {book.bookId && book.bookId.genre
                        ? Array.isArray(book.bookId.genre)
                          ? book.bookId.genre.join(", ")
                          : book.bookId.genre
                        : "No Genre Information"}{" "}
                      (Read on: {moment(book.readDate).format("MMMM DD, YYYY")})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={downloadPDF}
              className="download-pdf-button"
              style={{
                marginTop: "20px",
                padding: "10px 15px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Download as PDF
            </button>
          </div>
        ) : (
          <p>Generating report...</p>
        )}
      </SlidingPane>
    </div>
  );
};

export default Profile;

// Styles (Consider moving these to Profile.scss for better organization)
const buttonStyle = {
  padding: "8px 12px",
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
