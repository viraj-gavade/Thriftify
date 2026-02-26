const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectdb = require('./DataBase/connect');
const jwt = require('jsonwebtoken');
const Listing = require('./Schemas/listings.schemas');

// Routers
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router');
const asyncHandler = require('./utils/asynchandler');
const bookmarkRoutes = require('./Routes/bookmark.router');
const orderRoutes = require('./Routes/orders.router');
const CategoryRouter = require('./Routes/category.router');
const SearchRouter = require('./Routes/search.router');
const ChatRouter = require('./Routes/chat.router');

// Import Swagger packages and our swagger spec
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const SupportRouter = require('./Routes/support.router');
const verifyJWT = require('./Middlewares/authentication.middleware');

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Make io accessible to controllers
app.set('io', io);

// Socket.IO authentication & room management
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
    ?.split(';')
    ?.find((c) => c.trim().startsWith('accessToken='))
    ?.split('=')[1];
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
    socket.userId = decoded._id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Join personal room for private messages
  socket.join(`user:${socket.userId}`);

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('userTyping', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('stopTyping', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('userStopTyping', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Setup Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Thriftify API Documentation'
}));

// Authentication middleware to pass user data to templates
app.use((req, res, next) => {
  const token = req.cookies.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      req.user = decoded;
      res.locals.user = decoded; // Make user available to all templates
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

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

    // Extract all query parameters
    const query = req.query.query || '';
    const category = req.query.category || '';
    const location = req.query.location || '';
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Determine sort options based on sortBy parameter
    let sortBy = req.query.sortBy || 'newest';
    let sortOptions = { createdAt: -1 }; // default newest first
    
    switch(sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Build search query object
    const searchQuery = {
      isSold: false // Only show items that aren't sold yet
    };
    
    // Add text search if query parameter exists
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add category filter if provided
    if (category && category !== 'all') {

      // Use direct equality with lowercase for consistency with schema
      searchQuery.category = category.toLowerCase();
    }
    
    // Add location filter if provided
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }
    
    // Add price range filters if provided
    if (minPrice !== null || maxPrice !== null) {
      searchQuery.price = {};
      if (minPrice !== null) searchQuery.price.$gte = minPrice;
      if (maxPrice !== null) searchQuery.price.$lte = maxPrice;
    }


    // Get categories and locations for filter dropdowns
    const categories = await Listing.distinct('category');

    const locations = await Listing.distinct('location');
    
    try {
      // Fetch listings with search, filters and sorting applied
      const listings = await Listing.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('postedBy', 'fullname email');
          
      // Count total matching results for pagination
      const total = await Listing.countDocuments(searchQuery);

      // Render home page with listings and filters
      return res.status(200).render('home', { 
        listings: listings || [],
        categories,
        locations,
        filters: { 
          query, 
          category, 
          location, 
          minPrice, 
          maxPrice, 
          sortBy 
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).render('home', {
      listings: [],
      error: 'An unexpected error occurred'
    });
  }
}));

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
app.use('/api/search', SearchRouter);
app.use('/api/v1/chat', ChatRouter);

// Support routes
app.use('/support', SupportRouter);
app.use('/api/v1/support', SupportRouter);

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

  try {
    if (token) {
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
  res.status(200).render('payment-success.ejs', {
    user: req.user,
  });
});

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

// Global error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
});
