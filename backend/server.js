const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://vaibhav-git1.github.io',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskchat')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
