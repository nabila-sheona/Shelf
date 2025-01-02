import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookCard from "./BookCard";
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
      } catch (error) {
        console.error("Error fetching preferred pets or user ID:", error);
        // setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigate to browse page
  const handleBrowseBooks = () => {
    navigate("/browse");
  };

  // Navigate to search by genre page
  const handleSearchBooksByGenre = () => {
    navigate("/search-by-genre");
  };
  const handleBookClick = async (bookId) => {
    try {
      // Send the bookId in the request body to get the book details
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
    <div className="home-container">
      <h1>WELCOME TO SHELF</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleBrowseBooks}>Browse Books</button>
      <button onClick={handleSearchBooksByGenre}>Search Books by Genre</button>

      {preferredGenres.length > 0 && (
        <div className="preferred-genres">
          <h3>Your Preferred Genres:</h3>
          <p>{preferredGenres.join(", ")}</p>
        </div>
      )}

      <div className="preferred-genre-books">
        <h2>Your Recommended Books</h2>
        <div className="book-list">
          {books.length > 0 ? (
            books.map((book) => (
              <BookCard key={book._id} book={book} onClick={handleBookClick} />
            ))
          ) : (
            <p>No books available</p>
          )}
        </div>
      </div>
    </div>
  );
}
