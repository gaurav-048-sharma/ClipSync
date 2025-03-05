const Message = require('../models/messageModel.js');

// Create a message (already implemented as sendMessage)
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id; // From authMiddleware

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and content are required' });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// Read messages (already implemented as getConversation)
exports.getConversation = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user.id; // From authMiddleware

    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    })
      .populate('sender', 'username') // Populate sender username
      .populate('recipient', 'username') // Populate recipient username
      .sort({ timestamp: 1 }); // Sort by time ascending

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ message: 'Failed to fetch conversation', error: err.message });
  }
};

// Update message (already implemented as markAsRead)
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id; // From authMiddleware

    const message = await Message.findOneAndUpdate(
      { _id: messageId, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message marked as read', data: message });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Failed to mark message as read', error: err.message });
  }
};

// Update message content (new CRUD operation)
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!content) {
      return res.status(400).json({ message: 'Content is required to update the message' });
    }

    const message = await Message.findOneAndUpdate(
      { _id: messageId, sender: userId }, // Only sender can update
      { content },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message updated successfully', data: message });
  } catch (err) {
    console.error('Update message error:', err);
    res.status(500).json({ message: 'Failed to update message', error: err.message });
  }
};

// Delete a message (new CRUD operation)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id; // From authMiddleware

    const message = await Message.findOneAndDelete({
      _id: messageId,
      $or: [{ sender: userId }, { recipient: userId }], // Sender or recipient can delete
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Failed to delete message', error: err.message });
  }
};