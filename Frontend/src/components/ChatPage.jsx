import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle, Send, ArrowLeft, Search, Check,
  CheckCheck, MoreVertical, Tag, Loader2,
} from 'lucide-react';

const API = '/api/v1/chat';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect socket
  useEffect(() => {
    const s = io(window.location.origin, {
      withCredentials: true,
      auth: {},
    });
    s.on('connect_error', () => { /* socket auth failed — silent */ });
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', ({ message, conversationId: cId }) => {
      if (activeConv?._id === cId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        // Mark as read
        axios.patch(`${API}/conversations/${cId}/read`, {}, { withCredentials: true })
          .catch(() => {});
      }
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === cId
            ? {
                ...c,
                lastMessage: { content: message.content, sender: message.sender._id || message.sender, createdAt: message.createdAt },
                unreadCount: activeConv?._id === cId ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        ).sort((a, b) => new Date(b.updatedAt || b.lastMessage?.createdAt || 0) - new Date(a.updatedAt || a.lastMessage?.createdAt || 0))
      );
    });

    socket.on('userTyping', ({ conversationId: cId }) => {
      if (activeConv?._id === cId) setTyping(cId);
    });

    socket.on('userStopTyping', ({ conversationId: cId }) => {
      if (activeConv?._id === cId) setTyping(null);
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [socket, activeConv]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get(`${API}/conversations`, { withCredentials: true });
        const payload = data.data || data;
        setConversations(Array.isArray(payload) ? payload : []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Select conversation from URL (guard prevents infinite re-opening)
  const openedConvRef = useRef(null);
  useEffect(() => {
    if (conversationId && conversations.length > 0 && openedConvRef.current !== conversationId) {
      const conv = conversations.find((c) => c._id === conversationId);
      if (conv) {
        openedConvRef.current = conversationId;
        openConversation(conv);
      }
    }
  }, [conversationId, conversations]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMsgLoading(true);
    if (socket && activeConv?._id) {
      socket.emit('leaveConversation', activeConv._id);
    }
    try {
      const { data } = await axios.get(`${API}/conversations/${conv._id}/messages`, { withCredentials: true });
      const payload = data.data || data;
      setMessages(payload.messages || payload || []);
      scrollToBottom();
      // Join socket room
      if (socket) socket.emit('joinConversation', conv._id);
      // Mark as read
      await axios.patch(`${API}/conversations/${conv._id}/read`, {}, { withCredentials: true });
      setConversations((prev) => prev.map((c) => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setMsgLoading(false);
    }
    if (conv._id !== conversationId) {
      navigate(`/chat/${conv._id}`, { replace: true });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimistic = {
      _id: `temp-${Date.now()}`,
      content,
      sender: { _id: user?._id, fullname: user?.fullname, profilepic: user?.profilepic },
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      const { data } = await axios.post(`${API}/conversations/${activeConv._id}/messages`, { content }, { withCredentials: true });
      const msg = data.data || data;
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? msg : m)));
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id
            ? { ...c, lastMessage: { content, sender: user._id, createdAt: new Date().toISOString() } }
            : c
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      toast.error(err.response?.data?.message || 'Failed to send message');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !activeConv) return;
    socket.emit('typing', { conversationId: activeConv._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { conversationId: activeConv._id });
    }, 2000);
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => (p._id || p) !== user?._id) || {};
  };

  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const other = getOtherParticipant(c);
    const q = search.toLowerCase();
    return (
      other.fullname?.toLowerCase().includes(q) ||
      other.username?.toLowerCase().includes(q) ||
      c.listing?.title?.toLowerCase().includes(q)
    );
  });

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Mobile: show conversation list when no active conversation
  const showList = !activeConv || window.innerWidth >= 768;
  const showChat = !!activeConv;

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 py-0 sm:py-6">
      <div className="bg-card border border-border rounded-none sm:rounded-xl overflow-hidden shadow-card">
        <div className="flex h-[calc(100vh-8rem)]">
          {/* Conversation list */}
          <div className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex flex-col",
            activeConv ? 'hidden md:flex' : 'flex'
          )}>
            {/* List header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-display font-bold text-foreground mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Conversation items */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No matching conversations' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredConversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const isActive = activeConv?._id === conv._id;
                    return (
                      <button
                        key={conv._id}
                        onClick={() => openConversation(conv)}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition',
                          isActive && 'bg-primary/5 border-l-2 border-primary'
                        )}
                      >
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={other.profilepic} />
                          <AvatarFallback>{(other.fullname || '?')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">{other.fullname || other.username || 'User'}</p>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0">
                              {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage?.content || (conv.listing ? `About: ${conv.listing.title}` : 'Start chatting...')}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !activeConv ? 'hidden md:flex' : 'flex'
          )}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden -ml-2"
                    onClick={() => { setActiveConv(null); navigate('/chat', { replace: true }); }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={getOtherParticipant(activeConv).profilepic} />
                    <AvatarFallback>{(getOtherParticipant(activeConv).fullname || '?')[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{getOtherParticipant(activeConv).fullname || 'User'}</p>
                    {activeConv.listing && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {activeConv.listing.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {msgLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg, i) => {
                        const isMine = (msg.sender?._id || msg.sender) === user?._id;
                        const senderData = msg.sender || {};
                        const showAvatar = !isMine && (i === 0 || (messages[i - 1]?.sender?._id || messages[i - 1]?.sender) !== (msg.sender?._id || msg.sender));
                        return (
                          <div
                            key={msg._id}
                            className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
                          >
                            {!isMine && showAvatar && (
                              <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                                <AvatarImage src={senderData.profilepic} />
                                <AvatarFallback className="text-xs">{(senderData.fullname || '?')[0]}</AvatarFallback>
                              </Avatar>
                            )}
                            {!isMine && !showAvatar && <div className="w-7" />}
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                                isMine
                                  ? 'bg-primary text-white rounded-br-md'
                                  : 'bg-muted text-foreground rounded-bl-md'
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={cn(
                                'text-[10px] mt-1 flex items-center gap-1 justify-end',
                                isMine ? 'text-white/60' : 'text-muted-foreground'
                              )}>
                                {formatTime(msg.createdAt)}
                                {isMine && (msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {typing && (
                        <div className="flex gap-2 items-end">
                          <div className="w-7" />
                          <div className="bg-muted rounded-2xl px-4 py-2 text-sm rounded-bl-md">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                    placeholder="Type a message..."
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" disabled={!input.trim() || sending} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
