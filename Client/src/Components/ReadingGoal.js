import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import fetchUserProfile from "../utils/fetchUserProfile";

const ReadingGoal = () => {
  const [goal, setGoal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [newGoal, setNewGoal] = useState("");
  const [message, setMessage] = useState("");

  const fetchReadingGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data: userData } = await axios.get(
        "http://localhost:4000/users/profile", // Adjusted to match fetching profile with goal data
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched user data:", userData);

      // Extract reading goal data
      const goalData = userData.readingGoal;
      if (goalData) {
        setGoal(goalData.goal);
        setProgress(goalData.progress || 0);
      } else {
        setGoal(null);
        setProgress(0);
      }
    } catch (err) {
      console.error("Error fetching reading goal:", err.response?.data || err);
      toast.error("Failed to fetch reading goal. Please try again.");
    }
  };

  const handleSetGoal = async () => {
    if (!newGoal || newGoal <= 0) {
      toast.error("Goal must be a positive number.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Setting goal with value:", newGoal); // Debug log

      await axios.post(
        "http://localhost:4000/users/reading-goal",
        { goal: newGoal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Reading goal updated successfully.");
      fetchReadingGoal();
    } catch (err) {
      console.error("Error setting reading goal:", err.response?.data || err);
      toast.error("Failed to set reading goal. Please try again.");
    }
  };

  useEffect(() => {
    fetchReadingGoal();
  }, []);

  return (
    <div className="reading-goal">
      <h3>Annual Reading Goal</h3>
      {goal !== null ? (
        <p>
          Goal: {goal} books | Progress: {progress} books (
          {Math.round((progress / goal) * 100)}%)
        </p>
      ) : (
        <p>No goal set for this year.</p>
      )}
      <div>
        <input
          type="number"
          placeholder="Enter your goal"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <button onClick={handleSetGoal}>Set Goal</button>
      </div>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default ReadingGoal;
