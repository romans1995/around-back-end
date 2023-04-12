const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_TOKEN;
module.exports = (req, res, next) => {
    // get authorization from the header by destructuring
    const { authorization } = req.headers;
    // console.log(authorization)
    // check that the header exists and starts with 'Bearer '
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res
            .status(403)
            .send({ message: 'Authorization required' });
    }

    // auth header exists and is in correct format
    // so extract the token from the header
    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.log(err);
        return res
            .status(401)
            .send({ message: 'Authorization required' });
    }

    /* Save payload to request. This makes the payload available   
    to the latter parts of the route. See the `Accessing user 
    data with req.user` example for details. */
    req.user = payload;
    // sending the request to the next middleware
    return next();
};