import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);

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

  return (
    <div>
      <h1>Browse Books</h1>
      {books.length > 0 ? (
        books.map((book) => (
          <div key={book._id}>
            <h2>{book.name}</h2>
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
