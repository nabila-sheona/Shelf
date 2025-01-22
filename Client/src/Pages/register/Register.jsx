import React, { useState } from "react";
import newRequest from "../../utils/newRequest.js";
import { auth, provider, signInWithPopup } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Container,
} from "@mui/material";

const palette = {
  pinkLight: "#f6a5c0",
  pink: "#F48FB1",
  blueLight: "#4fc3f7",
  pinkDark: "#FFC5D2",
  redLight: "#EF9A9A",
  purple: "#CE93D8",
  offWhite: "#FFF9E7",
  orangeLight: "#ffcdd2",
  violet: "#b39ddb",
};

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
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    setEmailError("");

    try {
      const response = await newRequest.post(
        "http://localhost:4000/auth/register",
        {
          username: user.username,
          email: user.email,
          password: user.password,
        }
      );
      console.log(response.data);
      setSignupSuccess(true);
      setTimeout(() => setSignupSuccess(false), 3000);
      navigate("/login");
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Registration failed. Please try again.");
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
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: palette.offWhite,
          borderRadius: 2,
          p: 4,
          mt: 6,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ color: palette.pink, mb: 3 }}
        >
          Create a New Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Username"
              name="username"
              value={user.username}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ backgroundColor: palette.offWhite }}
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ backgroundColor: palette.offWhite }}
              required
              error={!!emailError}
              helperText={emailError}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={user.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ backgroundColor: palette.offWhite }}
              required
            />

            {signupSuccess && (
              <Alert severity="success">
                Signup successful! Redirecting...
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: palette.pink,
                color: "white",
                "&:hover": { backgroundColor: palette.pinkDark },
              }}
            >
              Register
            </Button>

            <Button
              variant="outlined"
              onClick={handleGoogleSignUp}
              sx={{
                color: palette.blueLight,
                borderColor: palette.blueLight,
                "&:hover": {
                  backgroundColor: palette.blueLight,
                  color: "white",
                },
              }}
            >
              Sign Up with Google
            </Button>
          </Stack>
        </form>
      </Container>
    </div>
  );
};

export default Register;
