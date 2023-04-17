const { PORT = 3000 } = process.env;
require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { errors } = require('celebrate');
const NotFoundError = require('./errors/NotFoundError');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const {
  validateUserBody,
  validateAuthentication,
} = require('./middlewares/validation');

const app = express();
mongoose.set('strictQuery', false);
// console.log("this is", process.env)
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

app.use(helmet());
app.use(limiter);

// authorization

app.use(requestLogger);
app.use(express.json());
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});
app.use(cors());
app.options('*', cors());

app.post('/signin', validateAuthentication, login);
app.post('/signup', validateUserBody, createUser);

app.use('/cards', auth, cardRoutes);
app.use('/users', auth, userRoutes);

app.use((req, res, next) => {
  next(new NotFoundError('The requested resource was not found'));
});
app.use(errorLogger);
app.use(errors());

app.use(errorHandler);
app.listen(PORT, () => {
  console.log('Server listening on port 3000');
});
