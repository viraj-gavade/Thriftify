const express = require('express');
const router = express.Router();
const {getChatBetweenUsers} = require('../Controllers/chat.controllers');

router.get('/:user1/:user2', getChatBetweenUsers);

module.exports = router;
 