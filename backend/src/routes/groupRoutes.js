const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    joinGroup,
    leaveGroup,
    getGroupMembers,
    requestToJoin,
    manageJoinRequest,
    inviteUser,
    getGroupRequests
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getGroups)
    .post(createGroup);

router.route('/:id')
    .get(getGroupById);

router.route('/:id/join')
    .post(joinGroup);

router.route('/:id/request')
    .post(requestToJoin);

router.route('/:id/manage-request')
    .post(manageJoinRequest);

router.route('/:id/invite')
    .post(inviteUser);

router.route('/:id/requests')
    .get(getGroupRequests);

router.route('/:id/leave')
    .post(leaveGroup);

router.route('/:id/members')
    .get(getGroupMembers);

// Chat Routes
const { getGroupChats } = require('../controllers/chatController');
router.get('/:id/chats', getGroupChats);

module.exports = router;
