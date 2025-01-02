const Review = require("../Model/review.model");
const Book = require("../Model/book.model");
const User = require("../Model/user.model");

const addOrUpdateReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bookId, rating, review } = req.body;

    if (!bookId || !rating || !review) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const userEmail = user.email;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });

    let existingReview = await Review.findOne({ userEmail, book: bookId });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review;
      await existingReview.save();
    } else {
      existingReview = new Review({
        userEmail,
        book: bookId,
        rating,
        review,
      });
      await existingReview.save();

      book.reviews.push(existingReview._id);
      book.numberOfReviews += 1;
    }

    const allReviews = await Review.find({ book: bookId });
    const totalRatings = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings / allReviews.length;

    book.averageRating = parseFloat(averageRating.toFixed(2));
    book.numberOfRatings = allReviews.length;
    await book.save();

    res.status(200).json({
      message: "Review submitted successfully.",
      review: existingReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book." });
    }
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
