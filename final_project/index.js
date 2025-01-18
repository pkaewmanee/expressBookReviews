const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const SECRET_KEY = "fingerprint_customer"; // Ensure consistency

// Middleware to parse JSON
app.use(express.json());

// Session setup for customer routes
app.use(
  "/customer",
  session({
    secret: SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware for token authentication on protected routes
app.use("/customer/auth/*", (req, res, next) => {
  const token = req.session?.token; // Retrieve token from session

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Verify the token
    req.user = decoded; // Attach decoded user to the request object
    next(); // Proceed to the next middleware/route
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
});

// Public and authenticated routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
