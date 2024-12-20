require("dotenv").config();
const express = require("express");
const userRoute = require("./Routes/user.route");
const authRoute = require("./Routes/auth.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const bookRoute = require("./Routes/book.route");
const Book = require("./Model/book.model");
const app = express();

// Configure cors
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const mongoose = require("mongoose");
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/books", bookRoute);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB Atlas:", err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
