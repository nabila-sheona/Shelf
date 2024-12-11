// src/Pages/register/Register.jsx
import React, { useState } from "react";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../../firebase"; // Firebase import for Google auth

const Register = () => {

  const  setError= useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    isSeller: false,
    desc: "",
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
          // Send 'uid' instead of 'id'
          uid: googleUser.uid,
          username: googleUser.displayName,
          email: googleUser.email,
        }
      );

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      if (!user.preferredGenre || user.preferredGenre.length === 0) {
        navigate("/preferences");
      } else {
        navigate("/");
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
      await newRequest.post("http://localhost:4000/auth/register", {
        ...user,
    
      });
      setSignupSuccess(true);
      setTimeout(() => setSignupSuccess(false), 3000);
      navigate("/login"); // Navigate to preferences page
    } catch (err) {
      console.log(err);
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
         

          <button type="submit">Register</button>
          {/* Google Sign-Up Button */}
          <button type="button" onClick={handleGoogleSignUp}>
            Sign Up with Google
          </button>
   <p>
          ALREADY have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>
          
        </div>
           
      
      </form>
    </div>
  );
};

export default Register;
