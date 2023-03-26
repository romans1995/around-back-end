const router = require('express').Router();
const {
  createCard, getCards, deletecardById, dislikeCard, likeCard,
} = require('../controllers/cards');

router.delete('/:_id', deletecardById);
router.get('/', getCards);
router.post('/', createCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
