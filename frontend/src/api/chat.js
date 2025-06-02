// src/api/chat.js
import API from '../services/api';

export const chatAPI = {
  getChats: (userId) => 
    API.get(`/chats/${userId}`),

  createChat: (chatData) => 
    API.post('/chats', chatData),

  getMessages: (chatId) => 
    API.get(`/chats/${chatId}/messages`),

  sendMessage: (chatId, content) => 
    API.post(`/chats/${chatId}/messages`, { content }),
};