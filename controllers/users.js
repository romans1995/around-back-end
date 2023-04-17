const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const ERROR_CODE = require('../errors/ERROR_CODE');
const SERVER_ERROR = require('../errors/SERVER_ERROR');
const ConflictError = require('../errors/ConflictError');

const { JWT_TOKEN = 'dev-key' } = process.env;

module.exports.getUserData = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('No user found with this Id');
    })
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // create a token
      const token = jwt.sign(
        { _id: user._id },
        JWT_TOKEN,

        {
          expiresIn: '7d',
        },
      );
      // req.headers.token = token;
      // return the token to client
      res.send({ token });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.params._id }).orFail(() => {
      throw new NotFoundError('No user/card found with that id');
    });
    res.send(user);
  } catch (err) {
    if (err.statusCode === NotFoundError) {
      next(new NotFoundError('invalid user id'));
    } else if (err.name === 'CastError') {
      next(new ERROR_CODE('invalid user id '));
    } else {
      next(err);
    }
  }
};
module.exports.createUser = async (req, res, next) => {
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
      next(new ConflictError('this email is taken'));
    }

    const newUser = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashdPassword,
    });
    const newUserdData = { name: newUser.name, about: newUser.about, _id: newUser._id };
    return res.status(201).send({ data: newUserdData });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ERROR_CODE('invalid data passed to the methods for creating a user '));
    }
    next(new SERVER_ERROR('An error has occurred on the server.'));
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    ).orFail(() => {
      throw new NotFoundError('No user/card found with that id');
    });
    return res.send(newUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ERROR_CODE('invalid data passed to the methods for creating a user'));
    } else if (err.statusCode === NotFoundError) {
      next(new NotFoundError('there is no such user'));
    } else {
      next(err);
    }
  }
};
module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    ).orFail(() => {
      throw new NotFoundError('No user/card found with that id');
    });
    res.send(newUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ERROR_CODE('invalid data passed to the methods for updating a user avatar '));
    } else if (err.statusCode === NotFoundError) {
      next(new NotFoundError('there is no such user'));
    } else {
      next(err);
    }
  }
};
