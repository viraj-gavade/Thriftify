const express = require('express');
const router = express.Router();
const chatController = require('../Controllers/chat.controllers');
const { isAuthenticated } = require('../Middleware/auth.middleware');

// Get all chat rooms for the user
router.get('/rooms', isAuthenticated, chatController.getUserChatRooms);

// Get a specific chat room by ID
router.get('/rooms/:roomId', isAuthenticated, chatController.getChatRoomById);

// Create a new chat room
router.post('/rooms', isAuthenticated, chatController.createChatRoom);

// Send a new message
router.post('/rooms/:roomId/messages', isAuthenticated, chatController.sendMessage);

// Legacy endpoint
router.get('/:user1/:user2', chatController.getChatBetweenUsers);

module.exports = router;
