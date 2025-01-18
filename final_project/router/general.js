const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let authUsers = require("./auth_users.js");
let users = authUsers.users; // Use the same users array for consistency
const public_users = express.Router();

// Simulated API endpoint for books data
const booksAPI = {
  fetchAllBooks: () => Promise.resolve(books),
  fetchBookByISBN: (isbn) => Promise.resolve(books[isbn]),
  fetchBooksByAuthor: (author) =>
    Promise.resolve(Object.values(books).filter(book => book.author === author)),
  fetchBooksByTitle: (title) =>
    Promise.resolve(Object.values(books).filter(book => book.title === title))
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check for missing username or password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate if the username already exists
  const userExists = authUsers.isValid(username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Add the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the list of books available in the shop using async/await
public_users.get('/', async (req, res) => {
  try {
    const bookList = await booksAPI.fetchAllBooks();
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN using async/await
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

// Get book details based on Author using Promises
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

// Get book details based on Title using Promises
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

// Get book reviews based on ISBN
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for the given ISBN." });
  }
});

// Get all books using an async callback function
public_users.get('/async/books', async (req, res) => {
  try {
    const booksList = await booksAPI.fetchAllBooks();
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Search book by ISBN using Promises
public_users.get('/promise/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  booksAPI
    .fetchBookByISBN(isbn)
    .then(book => {
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    });
});

// Search books by author using async/await
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const filteredBooks = await booksAPI.fetchBooksByAuthor(author);

    if (filteredBooks.length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for the given author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Search books by title using Promises
public_users.get('/promise/title/:title', (req, res) => {
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
