const express = require("express");
const {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
} = require("../Controller/user.controller"); // Ensure this path is correct
const { verifyToken } = require("../middleware/jwt"); // Ensure this path is correct

const router = express.Router();

router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", verifyToken, getUser);
router.post("/preferences", verifyToken, savePreferences);
router.get("/profile", verifyToken, getUser);
router.put("/update", verifyToken, updateUser);
module.exports = router; // Correct CommonJS export
