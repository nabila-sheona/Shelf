import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleBrowseBooks = () => {
    navigate("/browse");
  };

  const handleSearchBooksByGenre = () => {
    navigate("/search-by-genre"); // Assuming you have a route set up for this page
  };

  return (
    <div className="home-container">
      <h1>WELCOME TO SHELF</h1>
      <button onClick={handleBrowseBooks} className="browse-button">
        Browse Books
      </button>
      <button onClick={handleSearchBooksByGenre} className="search-button">
        Search Books by Genre
      </button>
    </div>
  );
}
