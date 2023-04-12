const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const requestLogger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: '../logs/request.log' })
    ]
});

const errorLogger = createLogger({
    level: 'error',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: '../logs/error.log' })
    ]
});

module.exports = { requestLogger, errorLogger };