const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/user', require('./routes/userRoute'));
app.use('/api/course', require('./routes/courseRoute'));
app.use('/api/match', require('./routes/matchingRoute'));

app.get('/', (req, res) => res.send('Server is up and running!'));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

module.exports = app;
