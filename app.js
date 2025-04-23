const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load env variables (if you're using dotenv)
// require('dotenv').config(); // Uncomment if needed

const PORT = process.env.PORT || 3000;

// ⛔️ No need to import body-parser separately, express has built-in support now
app.use(express.json()); // 👈 Handles application/json
app.use(express.urlencoded({ extended: true })); // 👈 Handles form-urlencoded
app.use(cookieParser()); // 🍪 Parses cookies
app.use(cors()); // 🌐 Allows CORS

// Set view engine
app.set('view engine', 'ejs');

// Set views directory (optional if using default /views)
app.set('views', path.join(__dirname, 'views'));

const connectdb = require('./DataBase/connect');
const UserRouter = require('./Routes/user.router');
const ListingRouter = require('./Routes/listing.router'); // Assuming you have a listing router
const OrderRouter = require('./Routes/orders.router'); // Assuming you have a listing router

// Base route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// API routes
app.use('/api/v1/user', UserRouter);
app.use('/api/v1/', ListingRouter); // Assuming you have a listing router
app.use('/api/v1/', OrderRouter); // Assuming you have a listing router

// DB connect + start server
const ConnectDB = async () => {
    try {
        await connectdb();
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ DB connection error:', error);
        process.exit(1);
    }
};

ConnectDB();
