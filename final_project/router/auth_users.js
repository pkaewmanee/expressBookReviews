const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = "fingerprint_customer"; // Ensure consistency across files
let users = []; // User storage (in-memory)

module.exports.users = users;

// Check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Authenticate username and password
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Log in an existing user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" }); // Generate token
  req.session.token = token; // Store token in session

  return res.status(200).json({
    message: "Login successful",
    token,
  });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!req.session || !req.session.token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(req.session.token, SECRET_KEY);
    const username = decoded.username;

    if (!isbn || !books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!req.session || !req.session.token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(req.session.token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
