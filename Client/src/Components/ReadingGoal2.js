import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  TextField,
  LinearProgress,
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
  orangelight: "#ffcdd2",
  violet: "#b39ddb",
};

const ReadingGoal2 = () => {
  const [goal, setGoal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [newGoal, setNewGoal] = useState("");

  const fetchReadingGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data: userData } = await axios.get(
        "http://localhost:4000/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    <div>
      {goal > 0 ? (
        <Box maxWidth="80%" sx={{ mb: 3, marginLeft: "10%" }}>
          <motion.div
            style={{ zIndex: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Goal: {goal} books | Progress: {progress} books (
              {Math.round((progress / goal) * 100)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(progress / goal) * 100}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: palette.orangelight,
                mb: 3,
              }}
            />
          </motion.div>
        </Box>
      ) : (
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            type="number"
            label="Set New Goal"
            variant="outlined"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            fullWidth
            sx={{ backgroundColor: palette.offWhite, borderRadius: 1 }}
          />
          <Button
            onClick={handleSetGoal}
            variant="contained"
            sx={{ backgroundColor: palette.blueLight, color: "white" }}
          >
            Set Goal
          </Button>
        </Box>
      )}
    </div>
  );
};

export default ReadingGoal2;
