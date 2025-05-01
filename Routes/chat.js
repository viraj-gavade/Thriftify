const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Ensure user is authenticated for all chat routes
router.use(auth);

// Get all chat rooms for current user
router.get('/api/chat/rooms', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all chat rooms where the current user is a participant
    const chatRooms = await ChatRoom.find({ users: userId })
      .populate('users', 'name email profilePicture')
      .populate('listing', 'title price images')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Create or get existing chat room
router.post('/api/chat/start', async (req, res) => {
  try {
    const { userId, listingId } = req.body;
    const currentUserId = req.user._id;
    
    // Check if user is logged in
    if (!currentUserId) {
      return res.status(401).json({ error: 'You must be logged in to start a chat' });
    }
    
    // Don't allow chat with yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }
    
    // Check if chat room already exists for these users and listing
    let chatRoom = await ChatRoom.findOne({
      users: { $all: [currentUserId, userId] },
      listing: listingId
    });
    
    // If no chat room exists, create one
    if (!chatRoom) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      chatRoom = new ChatRoom({
        users: [currentUserId, userId],
        listing: listingId,
        messages: []
      });
      
      await chatRoom.save();
    }
    
    res.json({ success: true, roomId: chatRoom._id });
    
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific chat room by ID
router.get('/api/chat/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;
    
    const chatRoom = await ChatRoom.findOne({ 
      _id: roomId,
      users: userId 
    })
    .populate('users', 'name email profilePicture')
    .populate('listing', 'title price images')
    .populate({
      path: 'messages',
      populate: { path: 'sender', select: 'name email profilePicture' }
    });
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    res.json(chatRoom);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

// Send a new message in a chat room
router.post('/api/chat/rooms/:id/messages', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;
    
    const chatRoom = await ChatRoom.findOne({ 
      _id: roomId,
      users: userId 
    });
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    const newMessage = {
      content,
      sender: userId,
      readBy: [userId]
    };
    
    chatRoom.messages.unshift(newMessage);
    chatRoom.updatedAt = Date.now();
    await chatRoom.save();
    
    // Populate the sender details
    const populatedMessage = await ChatRoom.populate(newMessage, {
      path: 'sender',
      select: 'name email profilePicture'
    });
    
    res.json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;