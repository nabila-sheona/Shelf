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

const getPreferredBooks = async (req, res) => {
  try {
    const { userId } = req.body; // User ID must be passed in the request body
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has preferred genres
    if (!user.preferredGenre || user.preferredGenre.length === 0) {
      return res.status(404).json({ message: "No matching genres found" });
    }

    // Fetch books that match the user's preferred genres
    const books = await Book.find({
      genre: { $in: user.preferredGenre }, // Match genres from user preferences
    });

    // If no books are found, return an appropriate message
    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found for your preferred genres" });
    }

    // Return the matching books
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching preferred books:", error);
    res.status(500).json({
      message: "Failed to fetch preferred books. Please try again later.",
    });
  }
};

const getBookProfile = async (req, res) => {
  const { id } = req.body; // Extract the book id from the request body

  try {
    // Find the book by its ID
    const book = await Book.findById(id);

    // If book is found, send it back as a response
    if (book) {
      res.json(book);
    } else {
      res.status(404).send("Book not found"); // If no book is found
    }
  } catch (error) {
    console.error("Error fetching book profile:", error);
    res.status(500).send("Error fetching book profile"); // Handle server errors
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
