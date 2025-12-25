import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import type { Conversation, Message } from '../types';

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Initialize Socket
  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') },
    });
    socketRef.current = socket;

    socket.on('user:updated', (updatedUser: any) => {
      setConversations(prev => prev.map(conv => 
        conv.id === updatedUser._id 
          ? { ...conv, participants: [{ ...conv.participants[0], name: updatedUser.fullName, avatar: updatedUser.avatar, status: updatedUser.status }] }
          : conv
      ));
    });

    socket.on('message:receive', (message: any) => {
      const msgChatId = typeof message.chatId === 'object' ? message.chatId.toString() : message.chatId;
      
      const normalizedMessage: Message = {
        id: message._id,
        content: message.content,
        senderId: message.sender._id || message.sender,
        createdAt: new Date(message.createdAt),
        status: 'delivered',
        type: message.type || 'text',
        attachments: message.attachments
      };

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.chatId === msgChatId || conv.id === normalizedMessage.senderId) {
            return {
              ...conv,
              lastMessage: normalizedMessage,
              unreadCount: msgChatId !== currentChatIdRef.current ? (conv.unreadCount || 0) + 1 : 0,
              updatedAt: new Date()
            };
          }
          return conv;
        });
        return updated.sort((a, b) => (b.lastMessage?.createdAt.getTime() || 0) - (a.lastMessage?.createdAt.getTime() || 0));
      });

      if (msgChatId === currentChatIdRef.current) {
        setMessages(prev => [...prev, normalizedMessage]);
      }
    });

    socket.on('message:deleted', ({ messageId, chatId }) => {
      if (chatId === currentChatIdRef.current) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
      setConversations(prev => prev.map(conv => 
        conv.chatId === chatId && conv.lastMessage?.id === messageId
          ? { ...conv, lastMessage: { ...conv.lastMessage!, content: 'Message deleted' } }
          : conv
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch Conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const [usersRes, chatsRes] = await Promise.all([api.get('/users'), api.get('/chats')]);
        const users = usersRes.data.data;
        const chats = chatsRes.data.data;
        const chatMap = new Map<string, any>(chats.map((c: any) => {
          const other = c.participants.find((p: any) => p.userId._id !== user.id);
          return other ? [other.userId._id, c] : null;
        }).filter((item: any): item is [string, any] => item !== null));

        const convs: Conversation[] = users.map((u: any) => {
          const chat = chatMap.get(u._id);
          return {
            id: u._id,
            chatId: chat?._id,
            participants: [{ id: u._id, name: u.fullName, status: u.status || 'offline', avatar: u.avatar }],
            unreadCount: 0,
            updatedAt: chat ? new Date(chat.updatedAt) : new Date(),
            lastMessage: chat?.lastMessage ? {
              id: chat.lastMessage._id,
              content: chat.lastMessage.content,
              senderId: chat.lastMessage.sender,
              createdAt: new Date(chat.lastMessage.createdAt),
              status: 'delivered',
              type: chat.lastMessage.type || 'text'
            } : undefined
          };
        });
        
        setConversations(convs.sort((a, b) => (b.lastMessage?.createdAt.getTime() || 0) - (a.lastMessage?.createdAt.getTime() || 0)));
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    };
    fetchConversations();
  }, [user]);

  // Join Chat
  useEffect(() => {
    if (!activeId || !user || !socketRef.current) return;
    const joinChat = async () => {
      try {
        const { data } = await api.post('/chats/c', { receiverId: activeId });
        const chatId = data.data._id;
        setCurrentChatId(chatId);
        socketRef.current?.emit('chat:join', chatId);

        const { data: msgData } = await api.get(`/messages/${chatId}`);
        setMessages(msgData.data.map((msg: any) => ({
          id: msg._id,
          content: msg.isDeletedForEveryone ? 'This message was deleted' : msg.content,
          senderId: msg.sender._id || msg.sender,
          createdAt: new Date(msg.createdAt),
          status: 'read',
          type: msg.type || 'text',
          attachments: msg.attachments
        })));
      } catch (error) {
        console.error('Failed to join chat', error);
      }
    };
    joinChat();
    return () => {
      if (currentChatIdRef.current) socketRef.current?.emit('chat:leave', currentChatIdRef.current);
    };
  }, [activeId, user]);

  const sendMessage = useCallback(async (content: string, attachments?: File[], audio?: Blob) => {
    if (!user || !currentChatId) return;

    let uploadedAttachments: any[] = [];
    if ((attachments?.length || 0) > 0 || audio) {
      const formData = new FormData();
      attachments?.forEach(file => formData.append('files', file));
      if (audio) formData.append('files', new File([audio], "voice.mp3", { type: "audio/mpeg" }));
      
      try {
        const { data } = await api.post('/messages/attachments', formData);
        uploadedAttachments = data.data.attachments;
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      content: audio ? 'Voice Message' : content,
      senderId: user.id,
      createdAt: new Date(),
      status: 'sending',
      type: audio ? 'audio' : (uploadedAttachments.length ? 'image' : 'text'),
      attachments: uploadedAttachments
    };

    setMessages(prev => [...prev, newMessage]);
    setConversations(prev => {
      const updated = prev.map(c => c.id === activeId ? { ...c, lastMessage: newMessage, updatedAt: new Date() } : c);
      return updated.sort((a, b) => (b.lastMessage?.createdAt.getTime() || 0) - (a.lastMessage?.createdAt.getTime() || 0));
    });

    socketRef.current?.emit('message:send', {
      chatId: currentChatId,
      content: newMessage.content,
      type: newMessage.type,
      attachments: uploadedAttachments,
      tempId: newMessage.id
    }, (res: any) => {
      if (res.status === 'ok') {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, id: res.data._id, status: 'sent', createdAt: new Date(res.data.createdAt) } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'failed' } : m));
      }
    });
  }, [user, currentChatId, activeId]);

  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    try {
      await api.delete(`/messages/${messageId}`, { data: { deleteForEveryone: forEveryone } });
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Delete failed', error);
    }
  }, []);

  return {
    conversations,
    messages,
    activeId,
    setActiveId,
    sendMessage,
    deleteMessage,
    activeUser: conversations.find(c => c.id === activeId)?.participants[0]
  };
}