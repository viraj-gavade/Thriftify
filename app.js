const express = require('express');
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectdb = require('./DataBase/connect');
const jwt = require('jsonwebtoken');
const Listing = require('./Schemas/listings.schemas'); // Import the Listing model

// Routers
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router');
const OrderRouter = require('./Routes/orders.router');
const ChatRouter = require('./Routes/chat.router'); 
const ChatViewController = require('./Routes/chat.view.router'); // Add this line
const asyncHandler = require('./utils/asynchandler');
const VerifyJwt = require('./Middlewares/authentication.middleware');
const bookmarkRoutes = require('./Routes/bookmark.router');

// Import routes
const listingsRoutes = require('./Routes/listing.router');
const chatRoutes = require('./Routes/chat.router');
const orderRoutes = require('./routes/orders.routes');

// Initialize app and server
const app = express();
const server = http.createServer(app); // Attach server to app

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Update this in production
    methods: ['GET', 'POST']
  }
});

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
const chatHandler = require('./socket/chatHandler');
const CategoryRouter = require('./Routes/category.router');

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);
  
  // Handle socket authentication with JWT
  socket.on('authenticate', async (token) => {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
      const userId = decoded._id;
      
      // Set user ID on the socket object
      socket.userId = userId;
      console.log('User authenticated:', userId);
      
      // Initialize chat handler
      chatHandler(io, socket);
    } catch (error) {
      console.error('Socket authentication error:', error);
    }
  });
  
  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
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

    const sortBy = req.query.sortBy || 'createdAt';
    const category = req.query.category;
    const location = req.query.location;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const user = req.user; // Get user from JWT middleware

    // Build query object dynamically
    const query = {};
    if (category) query.category = category;
    if (location) query.location = location;

    // Find and sort
    const listings = await Listing.find(query)
      .populate('postedBy', 'fullname email')
      .sort({ [sortBy]: sortOrder });

    if (!listings.length) {
      return res.render('home', { listings: [] });
    }

   return res.status(200).render('home', { listings: listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
 
}));

app.use('/api/v1/user', UserRouter);
app.use('/api/v1/listings', ListingRouter);
// app.use('/api/v1/orders', OrderRouter);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/chat', ChatRouter);
app.use('/chat', ChatViewController); // Add this line
app.use('/api/v1/category', CategoryRouter); // Add this line
app.use('/api/v1/orders', orderRoutes);

// Register routes


// Chat route to load the chat page
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

// app.get('/payment-cancel', (req, res) => {
  
// });

// app.get('/payment-success', (req, res) => {
//   res.render('payment-success');
// });

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

// Authentication routes to serve login and signup pages




// DB connect + server boot
const ConnectDB = async () => {
  try {
    await connectdb();
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error('❌ DB connection error:', error);
    process.exit(1);
  }
};

ConnectDB();
