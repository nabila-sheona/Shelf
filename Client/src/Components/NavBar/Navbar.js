import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

const Navbar = ({ title }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateUser = () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));

      const restrictedRoutes = ["/profile", "/services", "/pets"];
      const isRestrictedRoute = restrictedRoutes.includes(location.pathname);

      if (isRestrictedRoute && (!token || !storedUser)) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("/login");
      } else {
        setCurrentUser(storedUser);
      }
    };

    validateUser();
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleNorestriction = (path) => {
    navigate(path);
  };

  return (
    <AppBar position="static" sx={{ background: "#F8C8DC" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ color: "#6D4C41", cursor: "pointer" }}
          onClick={() => handleNorestriction("/")}
        >
          SHELF
        </Typography>
        <div>
          <Button
            color="inherit"
            sx={{
              color: location.pathname === "/" ? "#6D4C41" : "#6D4C41",
            }}
            onClick={() => handleNorestriction("/")}
          >
            Home
          </Button>
          {currentUser ? (
            <>
              <Button
                sx={{ color: "#6D4C41" }}
                onClick={() => handleNorestriction("/profile")}
              >
                Profile
              </Button>
              <Button sx={{ color: "#6D4C41" }} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button sx={{ color: "#6D4C41" }}>
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "#6D4C41" }}
              >
                Login
              </Link>
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
