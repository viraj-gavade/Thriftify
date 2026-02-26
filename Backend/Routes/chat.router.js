const express = require('express');
const router = express.Router();
const verifyJWT = require('../Middlewares/authentication.middleware');
const {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../Controllers/chat.controllers');

// All chat routes require authentication
router.use(verifyJWT);

// Get total unread message count
router.get('/unread-count', getUnreadCount);

// Get all conversations for authenticated user
router.get('/conversations', getUserConversations);

// Create or get existing conversation
router.post('/conversations', getOrCreateConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', sendMessage);

// Mark messages as read
router.patch('/conversations/:conversationId/read', markAsRead);

module.exports = router;
