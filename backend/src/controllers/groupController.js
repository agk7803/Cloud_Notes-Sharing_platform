const mongoose = require('mongoose');
const Group = require('../models/Group');
const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    try {
        const { name, subject, description, type } = req.body;

        if (!name || !subject || !type) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const group = await Group.create({
            name,
            subject,
            description,
            type,
            createdBy: req.user.uid,
            members: [req.user.uid] // Creator joins automatically
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all accessible groups (Public + User's Private)
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        const { filter } = req.query;

        let query = {};

        if (filter === 'my') {
            // Only groups user is a member of
            query = { members: req.user.uid };
        } else {
            // Discovery view: Return all groups (Public and Private)
            query = {};
        }

        const groups = await Group.find(query).sort({ createdAt: -1 });
        
        // Map groups to include member/request status for the current user
        const groupsWithStatus = groups.map(group => ({
            ...group.toObject(),
            isMember: group.members.includes(req.user.uid),
            hasRequested: group.requests?.includes(req.user.uid)
        }));

        res.json(groupsWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Group ID' });
        }
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check access
        const isMember = group.members.includes(req.user.uid);
        const hasRequested = group.requests?.includes(req.user.uid);

        // Everyone can see the metadata of a group (to allow requesting access)
        res.json({ ...group.toObject(), isMember, hasRequested });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a public group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Group ID' });
        }
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.type === 'Private') {
            return res.status(403).json({ message: 'Cannot join private group without invite' });
        }

        if (group.members.includes(req.user.uid)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        group.members.push(req.user.uid);
        await group.save();

        res.json({ message: 'Joined successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Group ID' });
        }
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Remove user from members
        group.members = group.members.filter(uid => uid !== req.user.uid);
        await group.save();

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request to join a private group
// @route   POST /api/groups/:id/request
// @access  Private
const requestToJoin = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.members.includes(req.user.uid)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        if (group.requests?.includes(req.user.uid)) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        group.requests.push(req.user.uid);
        await group.save();

        res.json({ message: 'Request submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject a join request
// @route   POST /api/groups/:id/manage-request
// @access  Private (Owner only)
const manageJoinRequest = async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'reject'
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.createdBy !== req.user.uid) return res.status(403).json({ message: 'Unauthorized' });

        if (action === 'approve') {
            group.requests = group.requests.filter(id => id !== userId);
            if (!group.members.includes(userId)) {
                group.members.push(userId);
            }
        } else {
            group.requests = group.requests.filter(id => id !== userId);
        }

        await group.save();
        res.json({ message: `Request ${action}ed successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invite user by email
// @route   POST /api/groups/:id/invite
// @access  Private (Owner only)
const inviteUser = async (req, res) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.createdBy !== req.user.uid) return res.status(403).json({ message: 'Unauthorized' });

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ message: 'User not found in academic database' });

        if (group.members.includes(userToInvite.firebaseUid)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(userToInvite.firebaseUid);
        group.requests = group.requests.filter(id => id !== userToInvite.firebaseUid);
        await group.save();

        res.json({ message: 'User provisioned successfully', user: userToInvite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending requests
// @route   GET /api/groups/:id/requests
// @access  Private (Owner only)
const getGroupRequests = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.createdBy !== req.user.uid) return res.status(403).json({ message: 'Unauthorized' });

        const requesters = await User.find({
            firebaseUid: { $in: group.requests }
        }).select('name email profilePicture firebaseUid');

        res.json(requesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all members in a group
// @route   GET /api/groups/:id/members
// @access  Private
const getGroupMembers = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Group ID' });
        }
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find users based on the Firebase UIDs stored in the members array
        const members = await User.find({
            firebaseUid: { $in: group.members }
        }).select('name email profilePicture firebaseUid');

        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
