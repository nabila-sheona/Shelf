import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/NavBar/Navbar";
import Profile from "./Components/Profile.jsx";
import Home from "./Components/Home.js";
import Login from "./Pages/login/Login.jsx";
import Register from "./Pages/register/Register.jsx";
import Preferences from "./Pages/register/Preferences.jsx";
const Layout = ({ children }) => (
  <>
    <Navbar title="SHELF" />
    {children}
  </>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/preferences"
          element={
            <Layout>
              <Preferences />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
