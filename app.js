const express = require('express');
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectdb = require('./DataBase/connect');
const jwt = require('jsonwebtoken');
let userSocketMap = {}; //
const Listing = require('./Schemas/listings.schemas'); // Import the Listing model

// Routers
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router');
const OrderRouter = require('./Routes/orders.router');
const ChatRouter = require('./Routes/chat.router'); // New
const asyncHandler = require('./utils/asynchandler');

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

// Routes
app.get('/', asyncHandler(async(req, res) => {
  try {
    // Get authentication token and set user in locals for template
    const token = req.cookies.token;
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
app.use('/api/v1/', ListingRouter);
app.use('/api/v1/', OrderRouter);

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

app.get('/payment-cancel', (req, res) => {
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
  res.status(200).render('index.ejs');
});

app.get('/payment-success', (req, res) => {
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
  res.status(200).render('home.ejs');
});

// PayPal payment callback routes
app.get('/payment-success', (req, res) => {
  res.render('payment-success');
});

app.get('/payment-cancel', (req, res) => {
  res.render('payment-cancel', { message: 'Payment was cancelled. Your order has not been processed.' });
});

// PayPal success/cancel callback routes
app.get('/payment-success', (req, res) => {
  // Render the payment success page
  res.render('payment-success');
});

app.get('/payment-cancel', (req, res) => {
  // Render the payment cancel page
  res.render('payment-cancel', { message: 'Your payment was cancelled. The order has not been processed.' });
});

// Authentication routes to serve login and signup pages
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/logout', (req, res) => {
  const options = {
    httpOnly: true,
    secure: true
  };
  
  return res.status(200)
    .clearCookie('token', options)
    .clearCookie('refreshToken', options)
    .redirect('/');
});

// Socket.IO Real-Time Messaging
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    console.log('jwt secrete:', process.env.ACCESS_TOKEN_SECRETE);
  
    // Listen for user login (JWT token sent from client)
    socket.on('user-logged-in', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);// Decode JWT to get user info
        const userId = decoded._id; // Extract userId from the JWT
        console.log('User ID:', userId);

  
        // Store userId and socketId
        userSocketMap[userId] = socket.id;
        console.log('User connected:',userId, socket.id);
      } catch (error) {
        console.log(error);
        console.error('Invalid token:', error);
      }
    });
  
    // Listen for a message from the Buyer or Sender
    socket.on('send-message', (messageData) => {
      const { senderId, receiverId, message } = messageData;
  
      // Find the receiver's socket ID from the map
      const receiverSocketId = userSocketMap[receiverId];
  
      if (receiverSocketId) {
        // Emit the message to the receiver's socket
        io.to(receiverSocketId).emit('newMessage', { senderId, message });
        console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
      } else {
        console.log(`Receiver ${receiverId} not connected`);
      }
    });
  
    // Typing indicator
    socket.on('typing', (userId) => {
      const receiverId = userId === 'buyerId' ? 'senderId' : 'buyerId'; // Example of mapping
      const receiverSocketId = userSocketMap[receiverId];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId });
      }
    });
  
    // When a user disconnects
    socket.on('disconnect', () => {
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          console.log('User disconnected:', userId);
          break;
        }
      }
    });
  });

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
