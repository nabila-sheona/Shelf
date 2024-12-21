import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate(); // Hook to navigate to BookProfile page

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:4000/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  const handleBookClick = async (bookId) => {
    try {
      // Send the bookId in the request body to get the book details
      const response = await axios.post(
        "http://localhost:4000/books/getBookProfile",
        { id: bookId }
      );

      // Navigate to the BookProfile page and pass the book data
      navigate("/bookprofile", { state: { book: response.data } });
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  return (
    <div>
      <h1>Browse Books</h1>
      {books.length > 0 ? (
        books.map((book) => (
          <div key={book._id}>
            <h2>
              {/* Use button to trigger handleBookClick */}
              <button onClick={() => handleBookClick(book._id)}>
                {book.name}
              </button>
            </h2>
            <p>Author: {book.author}</p>
            <p>Genres: {book.genre.join(", ")}</p>
            <p>
              Rating: {book.rate} ({book.numberOfRatings} ratings)
            </p>
          </div>
        ))
      ) : (
        <p>No books available</p>
      )}
    </div>
  );
}
