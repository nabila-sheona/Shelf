import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames";
//import "./Navbar.scss";

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

      // Only restrict access for protected routes
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
    <div className="navbar-container">
      <div>
        <ul className="navbar-links">
          <li>
            <button
              className={classNames({
                "active-link": location.pathname === "/",
              })}
              onClick={() => handleNorestriction("/")}
            >
              Home
            </button>
          </li>

          {currentUser ? (
            <>
              <li>
                <button>
                  <Link to="/profile">PROFILE</Link>
                </button>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <button>
              <Link to="/login">Login</Link>
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
