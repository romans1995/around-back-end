const User = require('../models/user');
const {
  NOT_FOUND_ERROR,
  ERROR_CODE,
  SERVER_ERROR,
} = require('../constants/utils');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(SERVER_ERROR).send({ message: 'Error' }));
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params._id }).orFail(() => {
      const error = new Error('No user/card found with that id');
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    });
    res.send(user);
  } catch (err) {
    if (err.statusCode === NOT_FOUND_ERROR) {
      res.status(NOT_FOUND_ERROR).send({ message: 'invalid user id' });
    } else if (err.name === 'CastError') {
      res.status(ERROR_CODE).send({ message: 'invalid user id' });
    } else {
      res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
    }
  }
};
module.exports.createUser = async (req, res) => {
  const { name, about, avatar } = req.body;
  try {
    const newUser = await User.create({ name, about, avatar });
    res.send(newUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(ERROR_CODE).send({ message: 'invalid data passed to the methods for creating a user ' });
    } else {
      res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
    }
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;
    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
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
module.exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
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
