const User = require("../Model/user.model");
const createError = require("../utils/createError");
const Book = require("../Model/book.model");
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account."));
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
  } catch (err) {
    next(err);
  }
};

const savePreferences = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { preferredGenre } = req.body;

    if (!preferredGenre) {
      return res.status(400).send("Preferred genres are required.");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferredGenre },
      { new: true }
    );

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send("Preferences saved successfully.");
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).send("Something went wrong!");
  }
};

const getUser = async (req, res, next) => {
  try {
    let user;

    if (req.uid) {
      user = await User.findOne({ uid: req.uid });
    } else {
      user = await User.findById(req.userId);
    }

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { username, email, newPassword } = req.body;
    const updatedData = { username, email };

    if (newPassword) updatedData.password = newPassword;

    // Use uid if available; otherwise, use userId
    const user = req.uid
      ? await User.findOneAndUpdate({ uid: req.uid }, updatedData, {
          new: true,
        })
      : await User.findByIdAndUpdate(req.userId, updatedData, { new: true });

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};
const getPreferredGenres = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json(user.preferredGenre);
  } catch (err) {
    next(err);
  }
};

const updateReadingStatus = async (req, res, next) => {
  try {
    const { bookId, bookName, list } = req.body;
    const validLists = ["wantToRead", "reading", "read"];

    if (!validLists.includes(list)) {
      return res.status(400).send("Invalid list name.");
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    validLists.forEach((listName) => {
      if (!Array.isArray(user[listName])) {
        user[listName] = [];
      }
    });

    validLists.forEach((listName) => {
      if (user[listName]) {
        user[listName] = user[listName].filter(
          (item) => item.bookId.toString() !== bookId.toString()
        );
      }
    });

    if (list === "read") {
      user[list].push({ bookId, bookName, readDate: new Date() });
      user.readCount += 1;
    } else {
      user[list].push({ bookId, bookName });
    }

    await user.save();
    res.status(200).send(`Book added to ${list}.`);
  } catch (err) {
    next(err);
  }
};

const getUserBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "wantToRead.bookId",
        select: "_id name author genre",
      })
      .populate({
        path: "reading.bookId",
        select: "_id name author genre",
      })
      .populate({
        path: "read.bookId",
        select: "_id name author genre",
      });

    if (!user) return res.status(404).json({ message: "User not found." });

    console.log("User Book Lists:", {
      wantToRead: user.wantToRead,
      reading: user.reading,
      read: user.read,
    });

    res.status(200).json({
      wantToRead: user.wantToRead,
      reading: user.reading,
      read: user.read,
    });
  } catch (err) {
    console.error("Error in getUserBooks:", err);
    next(err);
  }
};

const getBookGenre = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Book ID is required.");
    }

    const book = await Book.findById(id).select("genre");

    if (!book) {
      return res.status(404).send("Book not found.");
    }

    res.status(200).json({ genre: book.genre });
  } catch (err) {
    console.error("Error fetching book genre:", err);
    next(err);
  }
};

module.exports = {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  getPreferredGenres,
  updateReadingStatus,
  getUserBooks,
  getBookGenre,
};
