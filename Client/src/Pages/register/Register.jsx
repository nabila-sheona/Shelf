// src/Pages/register/Register.jsx
import React, { useState } from "react";
//import "./Register.scss";
import newRequest from "../../utils/newRequest.js";
import { auth, provider, signInWithPopup } from "../../firebase"; // Firebase import for Google auth
import { useNavigate } from "react-router-dom";

const Register = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleGoogleSignUp = async () => {
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

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user.email.includes("@")) {
    setEmailError("Please enter a valid email address.");
    return;
  }
  setEmailError(""); // Clear any previous error message

  try {
    // Do not include `uid` for regular registration
    const response = await newRequest.post("http://localhost:4000/auth/register", {
      username: user.username,
      email: user.email,
      password: user.password,
    });
    console.log(response.data);  // Log response for debugging
    setSignupSuccess(true);
    setTimeout(() => setSignupSuccess(false), 3000);
    navigate("/login");
  } catch (err) {
    console.error("Error during registration:", err);  // Log error
  }
};


  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          <label>Username</label>
          <input
            name="username"
            type="text"
            placeholder="Your username"
            onChange={handleChange}
          />
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="youremail@example.com"
            onChange={handleChange}
          />
          {emailError && <p className="error">{emailError}</p>}
          {signupSuccess && <p className="success">Signup successful!</p>}
          <label>Password</label>
          <input name="password" type="password" onChange={handleChange} />

          <button type="submit" onClick={handleSubmit}>Register</button>
          {/* Google Sign-Up Button */}
          <button type="button" onClick={handleGoogleSignUp}>
            Sign Up with Google
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
