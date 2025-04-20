const express = require('express');

const app = express();


const PORT = process.env.PORT || 3000;

const connectdb = require('./DataBase/connect');

const UserRouter = require('./Routes/user.routers');

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// The "/api/notes" endpoint responds with all notes from the database


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use('/api/v1/user', UserRouter);



const ConnectDB = async () => {
    try {
      await connectdb(); // Connect to the database

      app.listen(PORT, () => {
        console.log(`Server is listening on port: ${PORT}`); // Log when the server starts
      });
    } catch (error) {
      console.error('Something Went Wrong!!', error); // Log any connection errors
      process.exit(1); // Exit process if connection fails
    }
  };

ConnectDB(); // Call the function to connect to the database and start the server