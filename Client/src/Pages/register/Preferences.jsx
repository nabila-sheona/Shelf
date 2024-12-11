import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest"; // Axios instance
import "./Preferences.css";

const Preferences = () => {
  const [preferences, setPreferences] = useState({
    preferredGenre: [],  // Can be used for genres or any other preference
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if preferences already exist
    const checkPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await newRequest.get("http://localhost:4000/users/preferences", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If preferences exist, redirect to home
        if (res.data && res.data.preferredGenre.length > 0) {
          navigate("/");  // Redirect to home or dashboard
        }
      } catch (err) {
        console.error("Failed to fetch existing preferences:", err);
      }
    };

    checkPreferences();
  }, [navigate]);

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setPreferences((prev) => {
      const selected = prev[name];
      if (checked) {
        return { ...prev, [name]: [...selected, value] };
      } else {
        return { ...prev, [name]: selected.filter((item) => item !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Send preferences with token in Authorization header
      await newRequest.post(
        "http://localhost:4000/users/preferences",
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/");  // Redirect after successful save
      }, 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  return (
    <div className="preferences-container">
      <h1>Select Your Preferences</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <p>Select at least 3 genres:</p>
          <div className="checkbox-group">
            {["Action", "Romance", "Comedy", "Thriller", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Legal", "Historical", "Crime", "Adventure"].map((genre) => (
              <label key={genre}>
                <input
                  type="checkbox"
                  name="preferredGenre"  // Name should match the state property
                  value={genre}
                  onChange={handleCheckboxChange}
                />
                {genre}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="save-button">
          Save Preferences
        </button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Preferences;
