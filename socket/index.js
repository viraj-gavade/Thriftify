const chatHandler = require('./chatHandler');

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    chatHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};
