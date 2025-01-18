const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const public_users = express.Router();

// Simulating an API endpoint for books data
const booksAPI = {
  fetchAllBooks: () => Promise.resolve(books),
  fetchBookByISBN: (isbn) => Promise.resolve(books[isbn]),
  fetchBooksByAuthor: (author) =>
    Promise.resolve(Object.values(books).filter(book => book.author === author)),
  fetchBooksByTitle: (title) =>
    Promise.resolve(Object.values(books).filter(book => book.title === title))
};

// Task 10: Get the list of books available in the shop using async/await
public_users.get('/', async (req, res) => {
  try {
    const bookList = await booksAPI.fetchAllBooks();
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await booksAPI.fetchBookByISBN(isbn);

    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Task 12: Get book details based on Author using Promises
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;

  booksAPI
    .fetchBooksByAuthor(author)
    .then(filteredBooks => {
      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found for the given author" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by author", error: error.message });
    });
});

// Task 13: Get book details based on Title using Promises
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;

  booksAPI
    .fetchBooksByTitle(title)
    .then(filteredBooks => {
      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found for the given title" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});

module.exports.general = public_users;
