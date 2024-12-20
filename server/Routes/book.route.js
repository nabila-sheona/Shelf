const express = require("express");
const {
  addBook,
  getAllBooks,
  updateBook,
  searchBooksByGenre,
} = require("../Controller/book.controller");
const router = express.Router();

router.post("/add", addBook);
router.get("/", getAllBooks);
router.put("/update/:id", updateBook);
router.get("/search-by-genre", searchBooksByGenre);
module.exports = router;
