require('dotenv').config();

 const MONGO_URI = process.env.MONGO_URI;
 const DB_NAME = process.env.DB_NAME;

 module.exports = {
     MONGO_URI,
     DB_NAME,
 }
