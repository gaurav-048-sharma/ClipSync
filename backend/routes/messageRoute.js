const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, markAsRead, updateMessage, deleteMessage } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes requiring authentication
router.use(authMiddleware);

// CRUD Operations
router.post('/send', sendMessage);             // Create
router.get('/conversation/:recipientId', getConversation); // Read
router.put('/read/:messageId', markAsRead);    // Update (mark as read)
router.put('/update/:messageId', updateMessage); // Update (edit content)
router.delete('/:messageId', deleteMessage);    // Delete

module.exports = router;