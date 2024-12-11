import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest"; // Axios instance
import "./Preferences.css";

const Preferences = () => {
  const [preferences, setPreferences] = useState({
    preferredGenre: [],  // Array to store selected genres
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Check if preferences already exist and redirect if so
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await newRequest.get("http://localhost:4000/users/preferences", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // If preferences exist, redirect to home
          if (res.data && res.data.preferredGenre && res.data.preferredGenre.length > 0) {
            navigate("/");  // Redirect to home or dashboard
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing preferences:", err);
      }
    };

    checkPreferences();
  }, [navigate]);

  // Update preferences when checkbox is clicked
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setPreferences((prevPreferences) => {
      const updatedGenres = checked
        ? [...prevPreferences.preferredGenre, value]
        : prevPreferences.preferredGenre.filter((genre) => genre !== value);

      return { ...prevPreferences, preferredGenre: updatedGenres };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { preferredGenre } = preferences;

    if (preferredGenre.length < 3) {
      alert("Please select at least 3 genres.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await newRequest.post(
          "http://localhost:4000/users/preferences",
          { preferredGenre },  // Send selected genres
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccessMessage("Preferences saved successfully!");
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/");  // Redirect after successful save
        }, 3000);
      }
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
                  value={genre}
                  checked={preferences.preferredGenre.includes(genre)}
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
