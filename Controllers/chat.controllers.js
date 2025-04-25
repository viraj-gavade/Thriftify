const Chat = require('../models/chat.model');

const getChatBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;
  
  const messages = await Chat.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ timestamp: 1 });

  res.status(200).json(messages);
};


moudule.exports = {
    getChatBetweenUsers
    };
    