const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/:user1/:user2', chatController.getChatBetweenUsers);

module.exports = router;
