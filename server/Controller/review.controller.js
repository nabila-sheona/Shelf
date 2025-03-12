const Review = require("../Model/review.model");
const Book = require("../Model/book.model");
const User = require("../Model/user.model");
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer"); // Import Multer config

const addOrUpdateReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bookId, rating, review } = req.body;

    if (!bookId || !rating || !review) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });

    let fileUrl = "";

    if (req.file) {
      console.log("Uploading file to Cloudinary:", req.file.path);
      try {
        const uploadOptions = { folder: "Shelf" };

        if (req.file.mimetype.startsWith("video/")) {
          uploadOptions.resource_type = "video";
        }
        const result = await cloudinary.uploader.upload(
          req.file.path,
          uploadOptions
        );
        fileUrl = result.secure_url;
        console.log("Cloudinary Upload Success:", fileUrl);
      } catch (error) {
        console.error("Cloudinary Upload Failed:", error);
        return res.status(500).json({ message: "File upload failed.", error });
      }
    }

    let existingReview = await Review.findOne({
      userEmail: user.email,
      book: bookId,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review;
      existingReview.filename = fileUrl;
      await existingReview.save();
    } else {
      existingReview = new Review({
        userEmail: user.email,
        book: bookId,
        rating,
        review,
        filename: fileUrl,
      });
      await existingReview.save();
      book.reviews.push(existingReview._id);
      book.numberOfReviews += 1;
    }

    const allReviews = await Review.find({ book: bookId });
    book.averageRating = (
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
    ).toFixed(2);
    book.numberOfRatings = allReviews.length;
    await book.save();

    res.status(200).json({
      message: "Review submitted successfully.",
      review: existingReview,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewsByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    const reviews = await Review.find({ book: bookId }).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getUserReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const userEmail = user.email;

    const review = await Review.findOne({ book: bookId, userEmail });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrUpdateReview,
  getReviewsByBook,
  getUserReview,
};
