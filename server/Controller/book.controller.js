const Book = require("../Model/book.model");
const User = require("../Model/user.model");
const addBook = async (req, res, next) => {
  try {
    const { name, author, genre } = req.body;
    if (!name || !author || !genre) {
      return res.status(400).send("Name, author, and genre are required.");
    }
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).send("Book added successfully.");
  } catch (err) {
    next(err);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate, review } = req.body;

    const book = await Book.findById(id);
    if (!book) return res.status(404).send("Book not found.");

    if (rate) {
      book.numberOfRatings++;
      book.rate =
        (book.rate * (book.numberOfRatings - 1) + rate) / book.numberOfRatings;
    }

    if (review) {
      book.numberOfReviews++;
      book.reviews.push(review);
    }

    await book.save();
    res.status(200).send("Book updated successfully.");
  } catch (err) {
    next(err);
  }
};
const searchBooksByGenre = async (req, res) => {
  const { genre } = req.query;

  if (!genre) {
    return res.status(400).json({ message: "Genre parameter is required" });
  }

  try {
    const lowerCaseGenre = genre.toLowerCase();

    const books = await Book.find({
      genre: { $regex: new RegExp(`^${lowerCaseGenre}$`, "i") },
    });

    if (books.length > 0) {
      res.json(books);
    } else {
      res.status(404).json({ message: "No books found for this genre" });
    }
  } catch (error) {
    console.error("Error fetching books by genre:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPreferredBooks = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.preferredGenre || user.preferredGenre.length === 0) {
      return res.status(404).json({ message: "No matching genres found" });
    }

    const books = await Book.find({
      genre: { $in: user.preferredGenre },
    });

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found for your preferred genres" });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching preferred books:", error);
    res.status(500).json({
      message: "Failed to fetch preferred books. Please try again later.",
    });
  }
};

const getBookProfile = async (req, res) => {
  const { id } = req.body;

  try {
    const book = await Book.findById(id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error("Error fetching book profile:", error);
    res.status(500).send("Error fetching book profile");
  }
};

const getUserBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "wantToRead.bookId",
        select: "name author genre",
      })
      .populate({
        path: "reading.bookId",
        select: "name author genre",
      })
      .populate({
        path: "read.bookId",
        select: "name author genre",
      });

    if (!user) return res.status(404).send("User not found.");

    res.status(200).json({
      wantToRead: user.wantToRead,
      reading: user.reading,
      read: user.read,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addBook,
  getAllBooks,
  updateBook,
  searchBooksByGenre,
  getPreferredBooks,
  getBookProfile,
};
