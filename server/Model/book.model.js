const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: [String], required: true },
    averageRating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    numberOfReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
