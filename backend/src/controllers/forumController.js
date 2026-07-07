const Forum = require('../models/Forum');
const Message = require('../models/Message');
const User = require('../models/User');

exports.createForum = async (req, res) => {
  const { forumName, forumDesc, forumRules } = req.body;
  try {
    const forumId = 'FORUM_' + Date.now();
    const forum = new Forum({
      forumId,
      forumName,
      forumDesc: forumDesc || '',
      forumRules: forumRules || '',
      forumAdmins: [req.user.id],
      members: [req.user.id]
    });

    await forum.save();
    const populated = await Forum.findById(forum._id)
      .populate('members', 'username photo')
      .populate('forumAdmins', 'username photo');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create forum', error: error.message });
  }
};

exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate('members', 'username photo')
      .populate('forumAdmins', 'username photo');
    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve forums', error: error.message });
  }
};

exports.joinForum = async (req, res) => {
  const { id } = req.params;
  try {
    const forum = await Forum.findOne({ forumId: id });
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (forum.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member of this forum' });
    }

    forum.members.push(req.user.id);
    await forum.save();

    const populated = await Forum.findById(forum._id)
      .populate('members', 'username photo')
      .populate('forumAdmins', 'username photo');

    res.json({ message: 'Successfully joined the forum', forum: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join forum', error: error.message });
  }
};

exports.getForumMessages = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await Message.find({ forumId: id })
      .populate('author', 'username photo')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
};

exports.createMessage = async (req, res) => {
  const { forumId, messageContent } = req.body;
  try {
    const messageId = 'MSG_' + Date.now() + Math.floor(Math.random() * 1000);
    const message = new Message({
      messageId,
      forumId,
      author: req.user.id,
      messageContent
    });

    await message.save();
    const populated = await Message.findById(message._id).populate('author', 'username photo');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save message', error: error.message });
  }
};

exports.addMember = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  try {
    const forum = await Forum.findOne({ forumId: id });
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (!forum.forumAdmins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only forum admins can add members' });
    }

    const userToAdd = await User.findOne({ username });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (forum.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member of this forum' });
    }

    forum.members.push(userToAdd._id);
    await forum.save();

    const populated = await Forum.findById(forum._id)
      .populate('members', 'username photo')
      .populate('forumAdmins', 'username photo');

    res.json({ message: 'Member added successfully', forum: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  const { id, userId } = req.params;
  try {
    const forum = await Forum.findOne({ forumId: id });
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (!forum.forumAdmins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only forum admins can remove members' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot remove yourself' });
    }

    const index = forum.members.indexOf(userId);
    if (index === -1) {
      return res.status(400).json({ message: 'User is not a member of this forum' });
    }

    forum.members.splice(index, 1);

    const adminIndex = forum.forumAdmins.indexOf(userId);
    if (adminIndex !== -1) {
      forum.forumAdmins.splice(adminIndex, 1);
    }

    await forum.save();

    const populated = await Forum.findById(forum._id)
      .populate('members', 'username photo')
      .populate('forumAdmins', 'username photo');

    res.json({ message: 'Member removed successfully', forum: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};
