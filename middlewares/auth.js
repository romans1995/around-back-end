const jwt = require('jsonwebtoken');
let NODE_ENV = "production";
const { ForbiddenError, UnauthorizedError } = require('../errors');
const { JWT_TOKEN } = process.env || NODE_ENV;
module.exports = (req, res, next) => {
    // get authorization from the header by destructuring
    const { authorization } = req.headers;
    // console.log(authorization)
    // check that the header exists and starts with 'Bearer '
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new ForbiddenError('Authorization required');
    }

    // auth header exists and is in correct format
    // so extract the token from the header
    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
        payload = jwt.verify(token, JWT_TOKEN);

    } catch (err) {
        throw new UnauthorizedError('Authorization required');
    }

    /* Save payload to request. This makes the payload available   
    to the latter parts of the route. See the `Accessing user 
    data with req.user` example for details. */
    req.user = payload;
    // sending the request to the next middleware
    return next();
};