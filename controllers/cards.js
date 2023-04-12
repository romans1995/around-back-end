const Card = require('../models/card');
const {
    NOT_FOUND_ERROR,
    ERROR_CODE,
    SERVER_ERROR,
} = require('../constants/utils');

module.exports.getCards = (req, res, next) => {
    Card.find({})
        .then((card) => res.send({ data: card }))
        .catch(() => next(res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' })));
};

module.exports.createCard = async(req, res, next) => {
    const { name, link } = req.body;
    const owner = req.user._id;
    try {
        const newcard = await Card.create({ name, link, owner });
        res.send(newcard);
    } catch (err) {
        if (err.name === 'ValidationError') {
            next(res.status(ERROR_CODE).send({ message: 'try to check your data' }));
        } else {
            next(res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' }));
        }
    }
};
module.exports.deletecardById = async(req, res) => {
    try {
        const card = await Card.findByIdAndDelete({ _id: req.params._id }).orFail(() => {
            const error = new Error('No card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        });
        res.send(card);
    } catch (err) {
        if (err.name === 'CastError') {
            res.status(ERROR_CODE).send({ message: 'Invalid card id' });
        } else if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: err.message });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};
module.exports.likeCard = async(req, res) => {
    try {
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true }
        ).populate('likes');

        if (!updatedCard) {
            const error = new Error('No user/card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        }
        res.send(updatedCard);
    } catch (err) {
        if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: 'invalid card id' });
        } else if (err.name === 'CastError') {
            res.status(ERROR_CODE).send({ message: 'invalid card id' });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};


module.exports.dislikeCard = async(req, res) => {
    try {
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.cardId, { $pull: { likes: req.user._id } }, { new: true },
        ).orFail(() => {
            const error = new Error('No card found with that id');
            error.statusCode = NOT_FOUND_ERROR;
            throw error;
        });
        res.send(updatedCard);
    } catch (err) {
        if (err.statusCode === NOT_FOUND_ERROR) {
            res.status(NOT_FOUND_ERROR).send({ message: 'invalid card id' });
        } else if (err.name === 'CastError') {
            res.status(ERROR_CODE).send({ message: 'invalid card id' });
        } else {
            res.status(SERVER_ERROR).send({ message: 'An error has occurred on the server.' });
        }
    }
};