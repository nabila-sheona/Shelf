require("dotenv").config();
const express = require("express");
const userRoute = require("./Routes/user.route");
const authRoute = require("./Routes/auth.route");
const reviewRoutes = require("./Routes/review.route");
const commentRoutes = require("./Routes/comment.route.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const bookRoute = require("./Routes/book.router.js");
const Book = require("./Model/book.model");
const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS, PATCH, CONNECT",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const mongoose = require("mongoose");
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/books", bookRoute);
app.use("/reviews", reviewRoutes);
app.use("/comments", commentRoutes);

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
