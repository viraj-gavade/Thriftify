const Chat = require('../models/chat.model');

module.exports = (io, socket) => {
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, message } = data;

    // Save to DB
    const newMessage = await Chat.create({
      sender: senderId,
      receiver: receiverId,
      message
    });

    // Emit to receiver (if connected)
    io.emit(`receive_message_${receiverId}`, newMessage);
  });
};
