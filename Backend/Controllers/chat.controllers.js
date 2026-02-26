const { Conversation, Message } = require('../Schemas/chat.schemas');
const asyncHandler = require('../utils/asynchandler');
const CustomApiError = require('../utils/apiErrors');
const ApiResponse = require('../utils/apiResponse');

/**
 * Get or create a conversation between two users (optionally about a listing)
 */
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { recipientId, listingId } = req.body;

  if (!recipientId) {
    throw new CustomApiError(400, 'Recipient ID is required');
  }

  if (recipientId === userId.toString()) {
    throw new CustomApiError(400, 'Cannot start a conversation with yourself');
  }

  // Look for existing conversation between these two users
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, recipientId] },
    ...(listingId ? { listing: listingId } : {}),
  })
    .populate('participants', 'fullname username profilepic email')
    .populate('listing', 'title images price');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, recipientId],
      ...(listingId ? { listing: listingId } : {}),
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullname username profilepic email')
      .populate('listing', 'title images price');
  }

  return res.status(200).json(
    new ApiResponse('Conversation fetched successfully', conversation)
  );
});

/**
 * Get all conversations for the authenticated user
 */
const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'fullname username profilepic email')
    .populate('listing', 'title images price')
    .sort({ updatedAt: -1 });

  // Add unread count for each conversation
  const withUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        read: false,
      });
      return { ...conv.toObject(), unreadCount };
    })
  );

  return res.status(200).json(
    new ApiResponse('Conversations fetched successfully', withUnread)
  );
});

/**
 * Get messages for a conversation
 */
const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Verify user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new CustomApiError(404, 'Conversation not found');
  }
  if (!conversation.participants.some(p => p.toString() === userId.toString())) {
    throw new CustomApiError(403, 'Not authorized to view this conversation');
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'fullname username profilepic')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments({ conversation: conversationId });

  // Mark unread messages from the other user as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { read: true }
  );

  return res.status(200).json(
    new ApiResponse('Messages fetched successfully', {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  );
});

/**
 * Send a message in a conversation
 */
const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new CustomApiError(400, 'Message content is required');
  }

  // Verify user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new CustomApiError(404, 'Conversation not found');
  }
  if (!conversation.participants.some(p => p.toString() === userId.toString())) {
    throw new CustomApiError(403, 'Not authorized to send messages in this conversation');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content: content.trim(),
  });

  // Update last message in conversation
  conversation.lastMessage = {
    content: content.trim(),
    sender: userId,
    createdAt: new Date(),
  };
  await conversation.save();

  const populated = await Message.findById(message._id).populate(
    'sender',
    'fullname username profilepic'
  );

  // Emit via Socket.io if available
  const io = req.app.get('io');
  if (io) {
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId.toString()) {
        io.to(`user:${participantId}`).emit('newMessage', {
          message: populated,
          conversationId,
        });
      }
    });
  }

  return res.status(201).json(
    new ApiResponse('Message sent successfully', populated)
  );
});

/**
 * Mark messages as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      read: false,
    },
    { read: true }
  );

  return res.status(200).json(new ApiResponse('Messages marked as read', null));
});

/**
 * Get total unread message count across all conversations
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all conversations the user is part of
  const conversations = await Conversation.find({ participants: userId });
  const conversationIds = conversations.map((c) => c._id);

  const count = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: userId },
    read: false,
  });

  return res.status(200).json(
    new ApiResponse('Unread count fetched successfully', { count })
  );
});

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
