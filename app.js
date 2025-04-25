const express = require('express');
const http = require('http'); // For Socket.IO
const app = express();
const server = http.createServer(app); // Attach server to app
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // Update this in prod
    methods: ['GET', 'POST']
  }
});

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routers
const connectdb = require('./DataBase/connect');
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router');
const OrderRouter = require('./Routes/orders.router');
const ChatRouter = require('./Routes/chat.router'); // New

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/v1/user', UserRouter);
app.use('/api/v1/', ListingRouter);
app.use('/api/v1/', OrderRouter);
app.use('/api/v1/chat', ChatRouter);

app.get('/payment-cancel', (req, res) => {
  res.status(200).render('index.ejs');
});

app.get('/payment-success', (req, res) => {
  res.status(200).render('home.ejs');
});

// Socket.IO Real-Time Messaging
io.on('connection', (socket) => {
  console.log(`📡 New client connected: ${socket.id}`);

  // When a message is sent
  socket.on('send-message', ({ senderId, receiverId, message }) => {
    console.log(`✉️ ${senderId} ➡️ ${receiverId}: ${message}`);

    // Emit back to all clients OR to a specific receiver
    io.emit('receive-message', { senderId, receiverId, message, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// DB connect + server boot
const ConnectDB = async () => {
  try {
    await connectdb();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ DB connection error:', error);
    process.exit(1);
  }
};

ConnectDB();
