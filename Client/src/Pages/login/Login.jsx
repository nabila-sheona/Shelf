import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, TextField, Typography, Grid, Paper } from "@mui/material";
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import {
  auth,
  provider,
  githubProvider,
  signInWithPopup,
} from "../../firebase";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle regular login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
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
        navigate("/"); // Redirect to home if preferences exist
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

      const res = await axios.post("http://localhost:4000/auth/google-login", {
        uid: googleUser.uid,
        username: googleUser.displayName,
        email: googleUser.email,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Check if user has preferences set
      if (!user.preferredGenre || user.preferredGenre.length === 0) {
        navigate("/preferences");
      } else {
        navigate("/"); // Redirect to home if preferences exist
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  // Handle GitHub login
  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider); // Use GitHub provider
      const githubUser = result.user;

      // Send GitHub user data to the backend
      const res = await axios.post("http://localhost:4000/auth/github-login", {
        uid: githubUser.uid,
        username: githubUser.displayName,
        email: githubUser.email,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Check if user has preferences set
      if (!user.preferredGenre || user.preferredGenre.length === 0) {
        navigate("/preferences");
      } else {
        navigate("/"); // Redirect to home if preferences exist
      }
    } catch (error) {
      console.error("GitHub Sign-in Error:", error);
      setError("GitHub login failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FFF9E7",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Grid
        container
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF9E7",
        }}
      >
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{ backgroundColor: "#FFF9E7" }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Welcome to SHELF
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2, mb: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: "#2196f3" }}
              >
                Log In
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ mt: 1, mb: 1, borderColor: "#F48FB1", color: "#F48FB1" }}
              >
                Log In with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={handleGithubLogin}
                sx={{ mt: 1, borderColor: "#000", color: "#000" }}
              >
                Log In with GitHub
              </Button>
              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  style={{ color: "#F48FB1", textDecoration: "none" }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Login;
