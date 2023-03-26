const router = require('express').Router();

const {
  createUser, getUsers, getUserById, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/:_id', getUserById);
router.get('/', getUsers);
router.post('/', createUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
