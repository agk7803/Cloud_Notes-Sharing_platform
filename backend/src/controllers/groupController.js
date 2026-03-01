const Group = require('../models/Group');
const Note = require('../models/Note');

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
            // All Public groups OR groups user is member of
            query = {
                $or: [
                    { type: 'Public' },
                    { members: req.user.uid }
                ]
            };
        }

        const groups = await Group.find(query).sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check access
        if (group.type === 'Private' && !group.members.includes(req.user.uid)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a public group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
    try {
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

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    joinGroup,
    leaveGroup
};
