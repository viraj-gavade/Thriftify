const express = require('express');
const router = express.Router();
const chatController = require('../Controllers/chat.controllers');
const VerifyJwt = require('../Middlewares/authentication.middleware');


// Get all chat rooms for the user
router.get('/rooms',VerifyJwt ,chatController.getUserChatRooms);

// Get a specific chat room by ID
router.get('/rooms/:roomId',VerifyJwt ,chatController.getChatRoomById);

// Create a new chat room
router.post('/rooms', VerifyJwt,chatController.createChatRoom);

// Send a new message
router.post('/rooms/:roomId/messages',VerifyJwt ,chatController.sendMessage);

// Legacy endpoint
router.get('/:user1/:user2', chatController.getChatBetweenUsers);

module.exports = router;
