import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import { MessageSquare, Send, User, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Messages = () => {
  const { token, user, API_URL } = useAuth();
  const { showToast } = useToast();

  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // { otherUser, listing }
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Establish socket connection
  useEffect(() => {
    // Wrap server port
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5004');

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Fetch inbox threads
  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      setLoadingThreads(true);
      const res = await fetch(`${API_URL}/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setThreads(result.data);
      }
    } catch (err) {
      console.error('Error fetching inbox threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // 3. Listen to incoming messages in active thread room
  useEffect(() => {
    if (!activeThread || !socketRef.current) return;

    const roomId = `${activeThread.listing?._id || 'direct'}_${activeThread.otherUser._id}`;
    socketRef.current.emit('join_room', roomId);

    const handleIncomingMessage = (data) => {
      // If message belongs to active thread, push it to history
      if (
        data.listingId === activeThread.listing?._id &&
        (data.senderId === activeThread.otherUser._id || data.senderId === user._id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
      // Refresh inbox thread previews
      fetchInbox();
    };

    socketRef.current.on('receive_message', handleIncomingMessage);

    return () => {
      socketRef.current.off('receive_message', handleIncomingMessage);
    };
  }, [activeThread]);

  // 4. Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Fetch chat thread history
  const handleSelectThread = async (thread) => {
    setActiveThread(thread);
    try {
      setLoadingChat(true);
      const url = `${API_URL}/messages/thread/${thread.otherUser._id}?listingId=${thread.listing?._id || ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      showToast('Error loading conversation history', 'error');
    } finally {
      setLoadingChat(false);
    }
  };

  // 6. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeThread) return;

    const listingId = activeThread.listing?._id;
    const recipientId = activeThread.otherUser._id;
    const content = typedMessage.trim();

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ listingId, recipientId, content })
      });
      const result = await res.json();

      if (result.success) {
        const newMsg = result.data;
        
        // Append message locally
        setMessages((prev) => [...prev, newMsg]);
        setTypedMessage('');

        // Emit through socket
        const roomId = `${listingId || 'direct'}_${recipientId}`;
        socketRef.current.emit('send_message', {
          roomId,
          listingId,
          senderId: user._id,
          recipientId,
          content,
          sender: { _id: user._id, name: user.name, avatar: user.avatar }
        });

        fetchInbox();
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  return (
    <div className="container py-5 mt-4 text-white">
      <div className="glass-card" style={{ height: '75vh', overflow: 'hidden' }}>
        <div className="row g-0 h-100">
          
          {/* Left panel: Threads List */}
          <div 
            className={`col-md-4 border-end border-secondary h-100 d-flex flex-column ${activeThread ? 'd-none d-md-flex' : 'd-flex'}`}
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <div className="p-3 border-bottom border-secondary d-flex align-items-center gap-2">
              <MessageSquare className="text-primary" />
              <h5 className="mb-0 fw-bold">Inbox Messages</h5>
            </div>

            <div className="flex-grow-1 overflow-auto p-2">
              {loadingThreads ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
              ) : threads.length === 0 ? (
                <p className="text-white-50 text-center py-5 small">Your inbox is currently empty.</p>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {threads.map((th, idx) => {
                    const isSelected = activeThread?.otherUser._id === th.otherUser._id && activeThread?.listing?._id === th.listing?._id;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectThread(th)}
                        className={`btn text-start p-3 w-100 rounded text-white border-0 d-flex gap-2 align-items-center transition-all ${isSelected ? 'bg-primary' : 'hover-bg-dark'}`}
                        style={{ background: isSelected ? 'var(--primary-color)' : 'transparent' }}
                      >
                        <img 
                          src={th.otherUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                          alt="" 
                          className="rounded-circle border border-secondary"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex justify-content-between align-items-baseline">
                            <h6 className="mb-0 small fw-bold text-truncate">{th.otherUser.name}</h6>
                            <span className="text-white-50" style={{ fontSize: '9px' }}>
                              {new Date(th.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="small text-white-50 d-block text-truncate" style={{ fontSize: '11px' }}>
                            {th.listing?.title}
                          </span>
                          <p className="mb-0 small text-white-50 text-truncate text-opacity-75" style={{ fontSize: '11px' }}>
                            {th.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active Chat History */}
          <div 
            className={`col-md-8 h-100 d-flex flex-column ${!activeThread ? 'd-none d-md-flex align-items-center justify-content-center' : 'd-flex'}`}
            style={{ background: 'rgba(0,0,0,0.1)' }}
          >
            {activeThread ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <button 
                      onClick={() => setActiveThread(null)}
                      className="btn btn-link text-white p-0 d-md-none"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <img 
                      src={activeThread.otherUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                      alt="" 
                      className="rounded-circle"
                      style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{activeThread.otherUser.name}</h6>
                      <small className="text-white-50 d-flex align-items-center gap-1">
                        <Home size={12} /> {activeThread.listing?.title}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Messages Streams */}
                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3">
                  {loadingChat ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = (msg.sender?._id || msg.senderId) === user._id;
                      return (
                        <div 
                          key={idx}
                          className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div 
                            className={`p-3 rounded-3 max-width-70 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-dark-card border border-secondary text-white'}`}
                            style={{ 
                              borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              background: isMe ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)' 
                            }}
                          >
                            <p className="mb-1 small">{msg.content}</p>
                            <span 
                              className="d-block text-end text-white-50" 
                              style={{ fontSize: '9px', opacity: 0.6 }}
                            >
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Inputs Footer */}
                <form onSubmit={handleSendMessage} className="p-3 border-top border-secondary bg-dark-card">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      placeholder="Type a message..."
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-3">
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center p-5 text-white-50">
                <MessageSquare size={48} className="mb-3" />
                <h5>Select a conversation thread to start messaging</h5>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Messages;
