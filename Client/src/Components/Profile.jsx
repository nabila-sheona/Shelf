import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.scss";
import fetchUserProfile from "../utils/fetchUserProfile";

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [message, setMessage] = useState("");  // Ensure this is declared correctly
  const [bookLists, setBookLists] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });

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
        console.error(err);
        setMessage("Session expired. Please log in again.");  // Set the message here
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

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {message && <p className="message">{message}</p>}
      <div className="profile-info">
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <hr />
        <h3>Your Books</h3>

        {/* Want to Read */}
        <div>
          <h4>Want to Read</h4>
          {bookLists.wantToRead.length > 0 ? (
            <ul>
              {bookLists.wantToRead.map((book) => (
                <li key={book._id}>{book.name}</li>
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
              {bookLists.reading.map((book) => (
                <li key={book._id}>{book.name}</li>
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
              {bookLists.read.map((book) => (
                <li key={book._id}>{book.name}</li>
              ))}
            </ul>
          ) : (
            <p>No books in this list.</p>
          )}
        </div>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Profile;
