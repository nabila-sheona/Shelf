import React, { useState } from "react";
import "./Login.css";
import newRequest from "../../utils/newRequest.js";
import { useNavigate, Link } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle regular login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await newRequest.post("http://localhost:4000/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data;

      // Save token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Check if user has preferences set
      if (!user.preferredGenre || user.preferredGenre.length === 0) {
        navigate("/preferences");
      } else {
        navigate("/");  // Redirect to home if preferences exist
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const res = await newRequest.post(
        "http://localhost:4000/auth/google-login",
        {
          uid: googleUser.uid,
          username: googleUser.displayName,
          email: googleUser.email,
        }
      );

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Check if user has preferences set
      if (!user.preferredGenre || user.preferredGenre.length === 0) {
        navigate("/preferences");
      } else {
        navigate("/");  // Redirect to home if preferences exist
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Welcome to SHELF</h1>

        {/* Username field */}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Password field */}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login button */}
        <button type="submit">Log In</button>

        {/* Error message */}
        {error && <span className="error-message">{error}</span>}

        {/* Google Login Button */}
        <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
          Log In with Google
        </button>

        {/* Link to Sign Up page */}
        <p>
          Don't have an account yet?{" "}
          <Link to="/register" className="signup-link">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
