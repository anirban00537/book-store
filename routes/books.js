const express = require("express");
const Book = require("../models/books");
const router = express.Router();
const path = require("path");
const uploadPath = path.join("public", Book.coverImageBasePath);
const fs = require("fs");
const Author = require("../models/author");
const multer = require("multer");
const books = require("../models/books");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uplod = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

//all books route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});
//new books route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});
//create author route
router.post("/", uplod.single("cover"), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: filename,
    description: req.body.description,
  });
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newbook.id}`);
    res.redirect("books");
  } catch (error) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), (err) => {
    if (err) console.error(err);
  });
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error Creating book";

    res.render("books/new", params);
  } catch (error) {
    res.redirect("/books");
  }
}

module.exports = router;
