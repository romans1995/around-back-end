const Card = require('../models/card');
const {
  NOT_FOUND_ERROR,
  ERROR_CODE,
  SERVER_ERROR,
  NotFoundError,
  ForbiddenError,
} = require('../constants/utils');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => next(new SERVER_ERROR('An error has occurred on the server.')));
};

module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const newcard = await Card.create({ name, link, owner });
    res.send(newcard);
  } catch (err) {

    if (err.name === 'CastError') {
      next(new ERROR_CODE('Invalid card id'));
    } else if (err.statusCode === NotFoundError) {
      next(new NotFoundError(' bad request'));
    } else {
      next(new SERVER_ERROR('An error has occurred on the server.'));
    }

  }

};
module.exports.deletecardById = async (req, res, next) => {
  Card.findById({ _id: req.params._id }).orFail(() => new NOT_FOUND_ERROR('card not found'))
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        return next(new ForbiddenError('You are now the the owner of the card'));
      }
      return card.deleteOne()
        .then(() => res.send({ message: 'card delete' }));
    }).catch((err) => {
      if (err.name === 'CastError') {
        next(new ERROR_CODE('Invalid card id'));
      } else if (err.statusCode === NOT_FOUND_ERROR) {
        next(new NotFoundError('user not found'));
      } else {
        next(new SERVER_ERROR('An error has occurred on the server.'));
      }
    });
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true }).populate('likes');
    if (!updatedCard) {
      const error = new Error('No user/card found with that id');
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    }
    res.send(updatedCard);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ERROR_CODE('Invalid card id'));
    } else if (err.statusCode === NOT_FOUND_ERROR) {
      next(new NotFoundError('invalid card id'));
    } else {
      next(new SERVER_ERROR('An error has occurred on the server.'));
    }
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).orFail(() => {
      const error = new Error('No card found with that id');
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    });
    res.send(updatedCard);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ERROR_CODE('Invalid card id'));
    } else if (err.statusCode === NOT_FOUND_ERROR) {
      next(new NotFoundError('invalid card id'));
    } else {
      next(new SERVER_ERROR('An error has occurred on the server.'));
    }
  }
};
