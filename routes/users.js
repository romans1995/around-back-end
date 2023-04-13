const router = require('express').Router();

const {
    getUsers,
    getUserById,
    updateUser,
    updateAvatar,
    getUserData
} = require('../controllers/users');
const {
    validateProfile,
    validateAvatar,
    validateObjectId,
} = require('../middlewares/validation');

router.get('/me', getUserData);
router.get('/:_id', validateObjectId, getUserById);
router.get('/', getUsers);
router.put('/me', validateProfile, updateUser);
router.put('/me/avatar', validateAvatar, updateAvatar);


module.exports = router;