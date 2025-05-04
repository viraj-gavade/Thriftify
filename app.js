const express = require('express');
const http = require('http'); // For Socket.IO
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectdb = require('./DataBase/connect');
const jwt = require('jsonwebtoken');
const Listing = require('./Schemas/listings.schemas');

// Routers
const UserRouter = require('./Routes/user.router');
/**
 * Listing router - Handles all listing/product related API endpoints
 */
const ListingRouter = require('./Routes/listing.router');
 
/**
 * Async handler utility - Wraps async route handlers for error handling
 */
const asyncHandler = require('./utils/asynchandler');
/**
 * Bookmark routes - Manages user bookmark functionality
 */
const bookmarkRoutes = require('./Routes/bookmark.router');
/**
 * Order routes - Handles payment and order processing
 */
const orderRoutes = require('./Routes/orders.router');

// Initialize app and server
/**
 * Initialize Express application
 */
const app = express();

/**
 * Create HTTP server for Express application
 * This allows the Express app to handle HTTP requests
 */
const server = http.createServer(app); // Create HTTP server for Express

// Remove Socket.IO setup as it's not being used

// Setup Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware to pass user data to templates
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded; // Make user available to all templates
    } catch (error) {
      res.locals.user = null;
      console.error('Token verification failed:', error.message);
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// Chat socket handling
const CategoryRouter = require('./Routes/category.router');

// Routes
app.get('/', asyncHandler(async(req, res) => {
  try {
    // Get authentication token and set user in locals for template
    const token = req.cookies.accessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
        req.user = decoded;
        res.locals.user = decoded; // Make user available to template
      } catch (error) {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }

    const sortBy = req.query.sortBy || 'createdAt';
    const category = req.query.category;
    const location = req.query.location;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const user = req.user; // Get user from JWT middleware

    /**
     * Home route handler - Fetches and displays listings with optional filters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} Rendered home page with listings
     */
    // Build query object dynamically based on filter parameters
    const query = {};
    if (category) query.category = category;
    if (location) query.location = location;

    try {
      // Fetch listings with filters and sorting applied
      const listings = await Listing.find(query)
        .populate('postedBy', 'fullname email')
        .sort({ [sortBy]: sortOrder });

      // Render home page with listings (empty array if none found)
      return res.status(200).render('home', { 
        listings: listings || [],
        filters: { category, location, sortBy, sortOrder } // Pass filters for potential UI state
      });
    } catch (error) {
      // Log error for server-side debugging but don't expose details to client
      console.error('Error fetching listings:', error);
      return res.status(500).render('home', { 
        listings: [],
        error: 'Failed to load listings. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
    // Remove redundant outer catch that doesn't handle errors properly
    return res.status(500).render('home', {
      listings: [],
      error: 'An unexpected error occurred'
    });
  }
));

/**
 * API Routes Configuration
 * Registers all API endpoints with their respective routers
 */
// User management endpoints
app.use('/api/v1/user', UserRouter);
// Listing/product management endpoints
app.use('/api/v1/listings', ListingRouter);
// User bookmarks functionality
app.use('/api/v1/bookmarks', bookmarkRoutes);

// Category management endpoints
app.use('/api/v1/category', CategoryRouter);
// Order processing endpoints
app.use('/api/v1/orders', orderRoutes);

/**
 * Renders the chat interface page
 * Adds authenticated user to template context if available
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/api/v1/chat', (req, res) => {
  // Get authentication token and set user in locals for template
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  res.status(200).render('chat.ejs');
});


app.get('/payment-cancel', (req, res) => {
  // Get authentication token and set user in locals for template
  const token = req.cookies.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  res.status(200).render('index.ejs');
});

app.get('/success', (req, res) => {
  const { token } = req.query; // ?token=...

  console.log("Token from query:", token);

  try {
    
    console.log('✅ I am in payment success page');

    if (token) {
     console.log('entering payment success page with token:');
      // Redirect to capture payment route
      return res.redirect(`/api/v1/orders/payment/capture?token=${token}`);
    } else {
      return res.status(400).render('payment-cancel', { error: 'Missing payment token' });
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.locals.user = null;
    return res.status(401).render('payment-success', { error: 'Invalid token' });
  }
});

app.get('/payment-success', (req, res) => {
  // Get authentication token and set user in locals for template
  const token = req.cookies.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  res.status(200).render('payment-success.ejs');
}
);

app.get('/cancel', (req, res) => {
  // Get authentication token and set user in locals for template
  const token = req.cookies.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  res.status(200).render('payment-cancel.ejs');
}
);


// Add these routes to handle PayPal redirection:

// PayPal success and cancel routes
app.get('/payment-cancel', (req, res) => {
  res.render('payment-cancel');
});

/**
 * Database Connection and Server Initialization
 * Establishes MongoDB connection and starts the HTTP server
 * 
 * @returns {Promise<void>} - Resolves when connection is successful and server is running
 * @throws {Error} - If database connection fails, application exits with status code 1
 */
const ConnectDB = async () => {
  try {
    // Connect to MongoDB using the imported connector utility
    await connectdb();
    
    // Start the HTTP server once database connection is successful
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    // Log the error and exit the process with a failure code
    console.error('❌ DB connection error:', error);
    process.exit(1);
  }
};

ConnectDB();
