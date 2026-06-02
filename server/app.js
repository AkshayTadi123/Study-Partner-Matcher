const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', require('./routes/userRoute'));
app.use('/api/course', require('./routes/courseRoute'));
app.use('/api/match', require('./routes/matchingRoute'));

app.get('/', (req, res) => res.send('Server is up and running!'));

module.exports = app;
