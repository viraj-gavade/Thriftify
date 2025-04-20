const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load env variables (if you're using dotenv)
// require('dotenv').config(); // Uncomment if needed

const PORT = process.env.PORT || 3000;

// ⛔️ No need to import body-parser separately, express has built-in support now
app.use(express.json()); // 👈 Handles application/json
app.use(express.urlencoded({ extended: true })); // 👈 Handles form-urlencoded
app.use(cookieParser()); // 🍪 Parses cookies
app.use(cors()); // 🌐 Allows CORS

const connectdb = require('./DataBase/connect');
const UserRouter = require('./Routes/user.routers');

// Base route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// API routes
app.use('/api/v1/user', UserRouter);

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
