const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', forumController.createForum);
router.get('/', forumController.getForums);
router.post('/:id/join', forumController.joinForum);
router.get('/:id/messages', forumController.getForumMessages);
router.post('/:id/messages', forumController.createMessage);
router.post('/:id/members', forumController.addMember);
router.delete('/:id/members/:userId', forumController.removeMember);

module.exports = router;
