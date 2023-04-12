const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const {
    NOT_FOUND_ERROR,
    ERROR_CODE,
    SERVER_ERROR,
} = require('../constants/utils');

module.exports.getUserData = (req, res) => {
    console.log(req.user._id)
    User.findById(req.user._id)
        .orFail(() => {
            throw new Error('No user found with this Id');
        })
        .then((user) => res.status(200).send(user))
        .catch(() => res.status(SERVER_ERROR).send({ message: 'Error' }));
}

module.exports.login = (req, res, next) => {
    const { email, password } = req.body;

    return User.findUserByCredentials(email, password, next)
        .then((user) => {
            // create a token
            const token = jwt.sign({ _id: user._id },
                process.env.JWT_TOKEN, {
                    expiresIn: '7d',
                },
            );
            req.headers.token = token;
            // return the token to client
            res.send({ data: user.toJSON(), token });
        })
        .catch(() => {
            next(new Error('Incorrect email or password'));
        });
};

module.exports.getUsers = (req, res, next) => {
    User.find({})
        .then((user) => res.send({ data: user }))
        .catch((err) => next(res.status(SERVER_ERROR).send({ message: 'Error' })));
};

module.exports.getUserById = async(req, res, next) => {
    try {
        const user = await User.findById({ _id: req.user._id }).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        });
        res.send(user);
    } catch (next) {
        if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: 'invalid user id' });
        } else if (err.name === 'CastError') {
            res.status(ERROR_CODE).send({ message: 'invalid user id ' });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};
module.exports.createUser = async(req, res) => {
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
            return res.status(ERROR_CODE).send({ message: 'this email is taken ' });
        }

        const newUser = await User.create({
            name,
            about,
            avatar,
            email,
            password: hashdPassword,
        });

        return res.status(201).send({ data: newUser });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(ERROR_CODE).send({ message: 'invalid data passed to the methods for creating a user ' });
        }
        return res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
    }
};
// module.exports.createUser = async(req, res) => {
//     const {
//         name,
//         about,
//         avatar,
//         email,
//         password,
//     } = req.body;
//     const hashdPassword = await bcrypt.hash(password, 10);
//     User.findOne({ email }).then((user) => (user ? res.status(ERROR_CODE).send({ message: 'this email is takin ' }) : ''));
//     try {
//         await User.create({
//             name,
//             about,
//             avatar,
//             email,
//             password: hashdPassword,
//         }).then((user) => res.status(201).send({ data: user }));
//         // res.send(newUser);
//     } catch (err) {
//         console.log(err)
//         if (err.name === 'ValidationError') {
//             res.status(ERROR_CODE).send({ message: 'invalid data passed to the methods for creating a user ' });
//         } else {
//             res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
//         }
//     }
// };

module.exports.updateUser = async(req, res) => {
    try {
        const { name, about } = req.body;
        const newUser = await User.findByIdAndUpdate(
            req.user._id, { name, about }, { new: true, runValidators: true },
        ).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        });
        res.send(newUser);
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(ERROR_CODE).send({ message: 'invalid data passed to the methods for creating a user ' });
        } else if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: 'there is no such user' });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};
module.exports.updateAvatar = async(req, res) => {
    try {
        const { avatar } = req.body;
        const newUser = await User.findByIdAndUpdate(
            req.user._id, { avatar }, { new: true, runValidators: true },
        ).orFail(() => {
            const error = new Error('No user/card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        });
        res.send(newUser);
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(ERROR_CODE).send({ message: 'invalid data passed to the methods for updating a user avatar ' });
        } else if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: 'there is no such user' });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};