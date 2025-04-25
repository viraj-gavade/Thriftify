const express = require('express');
const http = require('http'); // For Socket.IO
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectdb = require('./DataBase/connect');
const jwt = require('jsonwebtoken');
let userSocketMap = {}; //

// Routers
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router');
const OrderRouter = require('./Routes/orders.router');
const ChatRouter = require('./Routes/chat.router'); // New

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

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/v1/user', UserRouter);
app.use('/api/v1/', ListingRouter);
app.use('/api/v1/', OrderRouter);

// Chat route to load the chat page
app.get('/api/v1/chat', (req, res) => {
  res.status(200).render('chat.ejs');
});

app.get('/payment-cancel', (req, res) => {
  res.status(200).render('index.ejs');
});

app.get('/payment-success', (req, res) => {
  res.status(200).render('home.ejs');
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
