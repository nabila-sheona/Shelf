import React, { useState } from "react";
import axios from "axios";

export default function SearchBooksByGenre() {
  const [genre, setGenre] = useState(""); // State to hold the input genre
  const [books, setBooks] = useState([]); // State to hold the books data
  const [error, setError] = useState(""); // To display error messages

  const handleSearch = async () => {
    if (!genre) {
      setError("please enter a genre to search.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/books/search-by-genre?genre=${genre}`
      );
      setBooks(response.data);
      setError(""); // Clear any previous errors
    } catch (error) {
      setBooks([]);
      setError("no books found for this genre.");
    }
  };

  return (
    <div>
      <h1>search books by genre</h1>
      <input
        type="text"
        placeholder="enter genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)} // Update genre state on change
      />
      <button onClick={handleSearch}>search</button>

      {/* Display Error Message */}
      {error && <p>{error}</p>}

      {/* Display Books if available */}
      {books.length > 0 ? (
        books.map((book) => (
          <div key={book._id}>
            <h2>{book.name}</h2>
            <p>author: {book.author}</p>
            <p>genres: {book.genre.join(", ")}</p>
            <p>
              rating: {book.rate} ({book.numberOfRatings} ratings)
            </p>
          </div>
        ))
      ) : (
        <p>no books available</p>
      )}
    </div>
  );
}
