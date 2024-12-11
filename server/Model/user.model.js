const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.uid; // Require password only if `uid` is not present
      },
    },
    desc: {
      type: String,
      required: false,
    },
    preferredGenre: {
      type: [String],
      required: false,
      enum: [
        "Action",
        "Romance",
        "Comedy",
        "Thriller",
        "Drama",
        "Fantasy",
        "Sci-Fi",
        "Horror",
        "Mystery",
        "Legal",
        "Historical",
        "Crime",
        "Adventure",
      ],
    },
    uid: {
      type: String,
      required: false, // Optional, only for Google users
      unique: true, // Ensure uniqueness for Google users
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
