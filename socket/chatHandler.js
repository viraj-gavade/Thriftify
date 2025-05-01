const Message = require('../Schemas/message.schemas');
const ChatRoom = require('../Schemas/chatroom.schemas');
const User = require('../Schemas/user.schemas');

// Store user socket mapping
let userSocketMap = {};

module.exports = function(io, socket) {
    console.log('A user connected:', socket.id);

    // User authentication with socket
    socket.on('authenticate', async (userId) => {
        try {
            // Store user's socket ID for future communication
            userSocketMap[userId] = socket.id;
            socket.userId = userId;
            
            console.log(`User ${userId} authenticated with socket ${socket.id}`);
            
            // Join rooms for all chatrooms this user is part of
            const chatRooms = await ChatRoom.find({ users: userId });
            chatRooms.forEach(room => {
                socket.join(room._id.toString());
            });
            
            // Notify other users that this user is online
            io.emit('user_status', { userId, status: 'online' });
        } catch (error) {
            console.error('Socket authentication error:', error);
        }
    });

    // Listen for incoming chat messages
    socket.on('send_message', async (messageData) => {
        try {
            const { roomId, content } = messageData;
            const senderId = socket.userId;
            
            if (!senderId) {
                console.log('Unauthenticated message attempt');
                return;
            }
            
            // 1. Save message to database
            const chatRoom = await ChatRoom.findOne({ 
                _id: roomId, 
                users: senderId 
            });
            
            if (!chatRoom) {
                console.log(`Chat room ${roomId} not found for user ${senderId}`);
                return;
            }
            
            const message = await Message.create({
                chatRoom: roomId,
                sender: senderId,
                content,
                readBy: [senderId]
            });
            
            // 2. Add message to chat room
            chatRoom.messages.push(message._id);
            chatRoom.updatedAt = Date.now();
            await chatRoom.save();
            
            // 3. Get populated message to broadcast
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'name email profilePicture');
            
            // 4. Broadcast to all users in the room
            io.to(roomId).emit('new_message', {
                roomId,
                message: populatedMessage
            });
            
            // 5. Send notification to receivers who are not in the room
            const receivers = chatRoom.users.filter(user => 
                user.toString() !== senderId.toString()
            );
            
            receivers.forEach(receiverId => {
                const receiverSocketId = userSocketMap[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message_notification', {
                        roomId,
                        message: populatedMessage
                    });
                }
            });
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    // Listen for typing status
    socket.on('typing', ({ roomId }) => {
        if (!socket.userId) return;
        
        socket.to(roomId).emit('typing', {
            roomId,
            userId: socket.userId
        });
    });

    // Listen for stop typing status
    socket.on('stop_typing', ({ roomId }) => {
        if (!socket.userId) return;
        
        socket.to(roomId).emit('stop_typing', {
            roomId,
            userId: socket.userId
        });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ roomId }) => {
        if (!socket.userId) return;
        
        try {
            await Message.updateMany(
                { 
                    chatRoom: roomId, 
                    sender: { $ne: socket.userId }, 
                    readBy: { $ne: socket.userId } 
                },
                { $addToSet: { readBy: socket.userId } }
            );
            
            socket.to(roomId).emit('messages_read', {
                roomId,
                userId: socket.userId
            });
        } catch (error) {
            console.error('Error marking messages read:', error);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            delete userSocketMap[socket.userId];
            io.emit('user_status', { userId: socket.userId, status: 'offline' });
        }
        console.log(`User disconnected: ${socket.id}`);
    });
};
