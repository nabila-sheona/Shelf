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
        return !this.uid;
      },
    },
    desc: {
      type: String,
      required: false,
    },
    preferredGenre: {
      type: [String],
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
    readingGoal: {
      year: { type: Number, required: false }, // Year for the goal
      goal: { type: Number, required: false }, // Number of books to read
      progress: { type: Number, default: 0 }, // Books read this year
    },
    uid: {
      type: String,
      default: null,
    },
    wantToRead: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        bookName: { type: String },
      },
    ],
    reading: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        bookName: { type: String },
      },
    ],
    read: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        bookName: { type: String },
        readDate: { type: Date },
      },
    ],

    readCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
