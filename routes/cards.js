const router = require('express').Router();
const {
    createCard,
    getCards,
    deletecardById,
    dislikeCard,
    likeCard,
} = require('../controllers/cards');
const {
    validateObjectIdCard,
    validateCard,
} = require('../middlewares/validation');


router.delete('/:_id', validateObjectIdCard, deletecardById);
router.get('/', getCards);
router.post('/', validateCard, createCard);
router.put('/:cardId/likes', validateObjectIdCard, likeCard);
router.delete('/:cardId/likes', validateObjectIdCard, dislikeCard);

module.exports = router;