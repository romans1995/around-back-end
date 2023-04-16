const { PORT = 3000 } = process.env;
require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
// const router = require('./routes');
const { NOT_FOUND_ERROR } = require('./constants/utils');
const { login, createUser, getUserData } = require('./controllers/users');
const auth = require('./middlewares/auth');
const router = require('express').Router();
const errorHandler = require('./middlewares/errorHandler');
const validator = require('validator');
const Joi = require('joi');
const { errors } = require('celebrate');
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

const validateUrl = (value, helpers) => {
    if (validator.isURL(value)) {
        return value;
    }
    return helpers.error('string.uri');
}

//validation value for the link property
Joi.string().required().custom(validateUrl)
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
    const error = new Error('The requested resource was not found');
    res.status(NOT_FOUND_ERROR)
    next(error);
});
app.use(errorLogger);
app.use(errors());

app.use(errorHandler);
app.listen(PORT, () => {
    console.log('Server listening on port 3000');
});