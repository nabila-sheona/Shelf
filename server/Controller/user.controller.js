const User = require("../Model/user.model"); // Ensure this path is correct
const createError = require("../utils/createError");

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account."));
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
  } catch (err) {
    next(err); // Make sure to handle errors
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

    // If `uid` is present in the request (indicating a Google user), find by `uid`
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

// Update user information by either `uid` for Google users or `_id` for other users
const updateUser = async (req, res, next) => {
  try {
    const { username, email, newPassword } = req.body;
    const updatedData = { username, email };

    if (newPassword) updatedData.password = newPassword;

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
const getPreferredGenres = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId); // Assuming `req.userId` is populated by middleware
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json(user.preferredGenre);
  } catch (err) {
    next(err);
  }
};
const updateReadingStatus = async (req, res, next) => {
  try {
    const { bookId, list } = req.body; // Expected `list`: 'wantToRead', 'reading', 'read'
    const validLists = ["wantToRead", "reading", "read"];

    if (!validLists.includes(list)) {
      return res.status(400).send("Invalid list name.");
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found.");

    // Remove the book from all lists
    validLists.forEach((listName) => {
      user[listName] = user[listName].filter((id) => id.toString() !== bookId);
    });

    // Add the book to the specified list
    user[list].push(bookId);

    await user.save();
    res.status(200).send(`Book added to ${list}.`);
  } catch (err) {
    next(err);
  }
};

const getUserBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate(
      "wantToRead reading read"
    );
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
// Export the functions
module.exports = {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  getPreferredGenres,
  updateReadingStatus,
  getUserBooks,
};
