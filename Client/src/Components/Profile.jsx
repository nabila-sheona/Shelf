import React, { useState, useEffect } from "react";
import "./Profile.scss";
import axios from "axios";
import fetchUserProfile from "../utils/fetchUserProfile"; // Import the function

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

useEffect(() => {
  const fetchUser = async () => {
    try {
      const data = await fetchUserProfile(); // Use the utility function
      setUser(data);
    } catch (err) {
      console.error(err);
      setMessage("Session expired. Please log in again.");
      localStorage.removeItem("token");       // Clear token on error
      localStorage.removeItem("currentUser"); // Clear user data on error
      window.location.href = "/login";        // Redirect to login
    }
  };

  fetchUser();
}, []);


  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!password) {
      setMessage("Please enter your current password to update your profile.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      

      const updateData = {
        ...user,
        password,
        newPassword: newPassword || undefined,
      };

      const res = await axios.put(
        "http://localhost:4000/users/update",
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setMessage("Profile updated successfully.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {message && <p className="message">{message}</p>}
      <div className="profile-info">
      
        <form onSubmit={handleUpdate} className="profile-form">
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          <hr />
          <h3>Change Password</h3>
          <div>
            <label>Current Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Profile;
