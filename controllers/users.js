const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const {
    NotFoundError,
    ERROR_CODE,
    SERVER_ERROR,
    ConflictError
} = require('../constants/utils');

let NODE_ENV = "production";
const { JWT_TOKEN } = process.env || NODE_ENV;

module.exports.getUserData = (req, res, next) => {
    console.log(req.user._id)
    User.findById(req.user._id)
        .orFail(() => {
            throw new Error('No user found with this Id');
        })
        .then((user) => res.status(200).send(user))
        .catch(() => next(new SERVER_ERROR('server error')));
}

module.exports.login = (req, res, next) => {
    const { email, password } = req.body;
    return User.findUserByCredentials(email, password, next)
        .then((user) => {
            // create a token
            const token = jwt.sign({ _id: user._id },
                JWT_TOKEN, {
                    expiresIn: '7d',
                },
            );
            req.headers.token = token;
            // return the token to client
            res.send({ token });
        })
        .catch(() => {
            next(new SERVER_ERROR('Incorrect email or password'));
        });
};

module.exports.getUsers = (req, res, next) => {
    User.find({})
        .then((user) => res.send({ data: user }))
        .catch(() => next(new SERVER_ERROR('Error')));
};

module.exports.getUserById = async(req, res, next) => {
    try {
        const user = await User.findById({ _id: req.params._id }).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NotFoundError;
            throw error;
        });
        res.send(user);
    } catch (next) {
        if (err.statusCode === NotFoundError) {
            next(new NotFoundError('invalid user id'));
        } else if (err.name === 'CastError') {
            next(new ERROR_CODE('invalid user id '));
        } else {
            next(new SERVER_ERROR('An error has occurred on the server.'));
        }
    }
};
module.exports.createUser = async(req, res, next) => {
    const {
        name,
        about,
        avatar,
        email,
        password,
    } = req.body;

    const hashdPassword = await bcrypt.hash(password, 10);

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            next(new ConflictError('this email is taken'))
        }

        const newUser = await User.create({
            name,
            about,
            avatar,
            email,
            password: hashdPassword,
        });
        const newUserdData = { name: newUser.name, about: newUser.about, _id: newUser._id }
        return res.status(201).send({ data: newUserdData });
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(new ERROR_CODE('invalid data passed to the methods for creating a user '));
        }
        next(new SERVER_ERROR('An error has occurred on the server.'));
    }
};

module.exports.updateUser = async(req, res, next) => {
    try {
        const { name, about } = req.body;
        const newUser = await User.findByIdAndUpdate(
            req.user._id, { name, about }, { new: true, runValidators: true },
        ).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NotFoundError;
            throw error;
        });
        return res.send(newUser);
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(new ERROR_CODE('invalid data passed to the methods for creating a user'));
        } else if (err.statusCode === NotFoundError) {
            next(new NotFoundError('there is no such user'));
        } else {
            next(new SERVER_ERROR('An error has occurred on the server.'));
        }
    }
};
module.exports.updateAvatar = async(req, res, next) => {
    try {
        const { avatar } = req.body;
        const newUser = await User.findByIdAndUpdate(
            req.user._id, { avatar }, { new: true, runValidators: true },
        ).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NotFoundError;
            throw error;
        });
        res.send(newUser);
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(new ERROR_CODE('invalid data passed to the methods for updating a user avatar '));
        } else if (err.statusCode === NotFoundError) {
            next(new NotFoundError('there is no such user'));
        } else {
            next(new SERVER_ERROR('An error has occurred on the server.'));
        }
    }
};