// src/components/BookCard.js

import React from "react";

export default function BookCard({ book, onClick }) {
  return (
    <div className="book-card">
      <h3>
        <button
          onClick={() => onClick(book._id)}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
        >
          {book.name}
        </button>
      </h3>
      <p>Author: {book.author}</p>
      <p>Genres: {book.genre.join(", ")}</p>
      <p>
        Rating: {book.rate || "N/A"} ({book.numberOfRatings} ratings)
      </p>
    </div>
  );
}
