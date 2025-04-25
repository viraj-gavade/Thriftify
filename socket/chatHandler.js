// chatHandler.js
module.exports = function(io, socket) {
    console.log('A user connected:', socket.id);

    // Listen for incoming chat messages
    socket.on('sendMessage', (message) => {
        console.log(`Received message: ${message}`);

        // Broadcast the message to other clients
        socket.broadcast.emit('newMessage', message);  // Broadcast to all users except the sender
    });

    // Listen for typing status
    socket.on('typing', () => {
        console.log(`${socket.id} is typing...`);
        socket.broadcast.emit('typing');  // Notify others that the user is typing
    });

    // Listen for stop typing status
    socket.on('stopTyping', () => {
        console.log(`${socket.id} stopped typing`);
        socket.broadcast.emit('stopTyping');  // Notify others that the user stopped typing
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};
