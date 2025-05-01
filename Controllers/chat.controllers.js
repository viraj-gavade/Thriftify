const Chat = require('../Schemas/chat.schemas');
const ChatRoom = require('../Schemas/chatroom.schemas');
const Message = require('../Schemas/message.schemas');
const User = require('../Schemas/user.schemas');
const Listing = require('../Schemas/listings.schemas');

// Get all chat rooms for the current logged-in user
const getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chatRooms = await ChatRoom.find({ users: userId })
      .populate('users', 'name email profilePicture')
      .populate('listing', 'title price images')
      .populate({
        path: 'messages',
        options: { 
          sort: { 'createdAt': -1 },
          limit: 1
        },
        populate: { path: 'sender', select: 'name' }
      });
      
    res.status(200).json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific chat room by ID
const getChatRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    
    const chatRoom = await ChatRoom.findOne({ _id: roomId, users: userId })
      .populate('users', 'name email profilePicture')
      .populate('listing', 'title price images description seller')
      .populate({
        path: 'messages',
        options: { sort: { 'createdAt': 1 } },
        populate: { path: 'sender', select: 'name' }
      });
    
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        chatRoom: roomId, 
        sender: { $ne: userId }, 
        readBy: { $ne: userId } 
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.status(200).json(chatRoom);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new chat room
const createChatRoom = async (req, res) => {
  try {
    const { listingId, sellerId } = req.body;
    const buyerId = req.user._id;
    
    // Check if users and listing exist
    const [listing, seller] = await Promise.all([
      Listing.findById(listingId),
      User.findById(sellerId)
    ]);
    
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    
    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      listing: listingId,
      users: { $all: [buyerId, sellerId] }
    });
    
    if (chatRoom) {
      return res.status(200).json({ message: 'Chat room already exists', chatRoomId: chatRoom._id });
    }
    
    // Create new chat room
    chatRoom = await ChatRoom.create({
      users: [buyerId, sellerId],
      listing: listingId,
      messages: []
    });
    
    res.status(201).json({ message: 'Chat room created', chatRoomId: chatRoom._id });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;
    
    const chatRoom = await ChatRoom.findOne({ _id: roomId, users: senderId });
    
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    const message = await Message.create({
      chatRoom: roomId,
      sender: senderId,
      content,
      readBy: [senderId]
    });
    
    // Add message ID to chat room
    chatRoom.messages.push(message._id);
    chatRoom.updatedAt = Date.now();
    await chatRoom.save();
    
    await message.populate('sender', 'name email profilePicture');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

module.exports = {
  getChatBetweenUsers,
  getUserChatRooms,
  getChatRoomById,
  createChatRoom,
  sendMessage
};
