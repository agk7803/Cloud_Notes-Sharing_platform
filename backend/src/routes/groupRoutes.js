const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    joinGroup,
    leaveGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getGroups)
    .post(createGroup);

router.route('/:id')
    .get(getGroupById);

router.route('/:id/leave')
    .post(leaveGroup);

// Chat Routes
const { getGroupChats } = require('../controllers/chatController');
router.get('/:id/chats', getGroupChats);

module.exports = router;
