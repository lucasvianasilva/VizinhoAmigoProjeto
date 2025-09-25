// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import './Chat.css';

interface Message {
  id: number;
  conteudo: string;
  remetente_id: number;
}

interface ChatProps {
  conversaId: number;
  currentUserId: number;
  otherUserName: string;
  destinatarioId: number; // ID do usuário que deve receber a notificação
}

const Chat: React.FC<ChatProps> = ({ conversaId, currentUserId, otherUserName, destinatarioId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    const room = `conversa_${conversaId}`;
    socketRef.current.emit('join_room', { room });

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/api/conversa/${conversaId}/mensagens`);
        setMessages(response.data);
      } catch (error) {
        console.error("Erro ao buscar histórico de mensagens", error);
      }
    };
    fetchHistory();

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [conversaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        conteudo: newMessage,
        conversa_id: conversaId,
        remetente_id: currentUserId,
        destinatario_id: destinatarioId // Envia o ID do destinatário
      };
      socketRef.current.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Conversando com: <strong>{otherUserName}</strong>
      </div>
      <div className="chat-window">
        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.remetente_id === currentUserId ? 'sent' : 'received'}`}>
              {msg.conteudo}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;