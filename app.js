const express = require('express');

const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// The "/api/notes" endpoint responds with all notes from the database


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}   );