import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]); // State for books
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(""); // State for error messages
  const [preferredGenres, setPreferredGenres] = useState([]); // State for user genres

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

  return (
    <div className="home-container">
      <h1>WELCOME TO SHELF</h1>

      {/* Display Loading or Error */}
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleBrowseBooks}>Browse Books</button>
      <button onClick={handleSearchBooksByGenre}>Search Books by Genre</button>
      {/* Display Preferred Genres */}
      {preferredGenres.length > 0 && (
        <div className="preferred-genres">
          <h3>Your Preferred Genres:</h3>
          <p>{preferredGenres.join(", ")}</p>
        </div>
      )}

      {/* Display Recommended Books */}
      <div className="preferred-genre-books">
        <h2>Your Recommended Books</h2>
        <div className="book-list">
          {books.length > 0
            ? books.map((book) => (
                <div key={book._id} className="book-card">
                  <h3>{book.name}</h3>
                  <p>Author: {book.author}</p>
                  <p>Genre: {book.genre.join(", ")}</p>
                  <p>Rating: {book.rate || "N/A"}</p>
                </div>
              ))
            : !loading && <p>No books available for your preferred genres.</p>}
        </div>
      </div>
    </div>
  );
}
