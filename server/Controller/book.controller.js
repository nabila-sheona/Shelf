const Book = require("../Model/book.model");

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
  const { genre } = req.query; // Get genre from query params

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
module.exports = { addBook, getAllBooks, updateBook, searchBooksByGenre };
