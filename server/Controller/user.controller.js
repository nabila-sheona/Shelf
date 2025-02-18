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
      const currentYear = new Date().getFullYear();
      if (user.readingGoal && user.readingGoal.year === currentYear) {
        user.readingGoal.progress += 1;
      }
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
const setReadingGoal = async (req, res, next) => {
  try {
    const { goal } = req.body;
    const currentYear = new Date().getFullYear();

    if (!goal || goal <= 0) {
      return res.status(400).send("Goal must be a positive number.");
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    // Update or initialize readingGoal
    if (!user.readingGoal || user.readingGoal.year !== currentYear) {
      user.readingGoal = { year: currentYear, goal, progress: 0 };
    } else {
      user.readingGoal.goal = goal; // Update goal if already exists
    }

    await user.save();
    res.status(200).json({
      message: "Reading goal updated successfully.",
      readingGoal: user.readingGoal,
    });
  } catch (err) {
    console.error("Error setting reading goal:", err);
    next(err);
  }
};

const getReadingGoal = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json(user.readingGoal || {});
  } catch (err) {
    next(err);
  }
};

const resetReadingProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    user.readingGoal.progress = 0;
    await user.save();

    res.status(200).json({ message: "Reading progress reset successfully." });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /users/:id
 * Partially updates user data (e.g. user.desc)
 * Only allowed if req.userId matches user._id (or any custom logic)
 */
const partialUpdateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Convert both sides to strings just in case
    if (req.userId.toString() !== id.toString()) {
      return next(
        createError(403, "You can only partially update your own account.")
      );
    }

    const updateFields = {};
    if (req.body.desc !== undefined) updateFields.desc = req.body.desc;
    if (req.body.username !== undefined)
      updateFields.username = req.body.username;
    // ... other fields

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!updatedUser) {
      return next(createError(404, "User not found."));
    }
    return res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

/**
 * CONNECT /users/connect-demo
 * A demonstration of handling a CONNECT request.
 * Often used for tunneling (e.g., proxying HTTPS).
 * Not typical in standard REST APIs, so here we just respond with a message.
 */
const handleConnectRequest = async (req, res, next) => {
  try {
    // Since CONNECT is unusual, let's just end the connection with a 200 OK and a small message.
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("CONNECT request received! Connection established (demo).");
  } catch (error) {
    next(error);
  }
};

/**
 * OPTIONS /users
 * Return allowed methods for this route
 */
const handleOptionsRequest = (req, res) => {
  // List the methods you support
  res.set("Allow", "GET,POST,PUT,DELETE,PATCH,CONNECT,OPTIONS");
  return res.sendStatus(200);
};
const updateUserimg = async (req, res, next) => {
  try {
    const { username, email, img } = req.body;
    const updatedData = { username, email, img };
    // Use `uid` if available; otherwise, use `userId`
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
module.exports = {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  getPreferredGenres,
  updateReadingStatus,
  getUserBooks,
  getBookGenre,
  setReadingGoal,
  getReadingGoal,
  resetReadingProgress,
  partialUpdateUser,
  handleConnectRequest,
  handleOptionsRequest,
  updateUserimg,
};
