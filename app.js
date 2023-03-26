const { PORT = 3000 } = process.env;
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { NOT_FOUND_ERROR } = require('./constants/utils');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

mongoose.connect('mongodb://127.0.0.1:27017/aroundb');
mongoose.set('strictQuery', true);
app.use((req, res, next) => {
  req.user = { _id: '63ff590682ad41f0582569bc' };
  next();
});
app.use(helmet());
app.use(limiter);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'routes')));
app.use('/cards', cardRoutes);
app.use('/users', userRoutes);
app.use((req, res) => {
  res.status(NOT_FOUND_ERROR).send({ message: 'The requested resource was not found' });
});
app.listen(PORT, () => {
  console.log('Server listening on port 3000');
});
