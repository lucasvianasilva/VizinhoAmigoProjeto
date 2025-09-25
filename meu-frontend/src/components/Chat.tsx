// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext'; // Importa nosso hook de contexto
import api from '../services/api';
import './Chat.css';

interface Message {
  id: number;
  conteudo: string;
  remetente_id: number;
  conversa_id: number; // Adicionado para garantir que a mensagem é da conversa certa
}

interface ChatProps {
  conversaId: number;
  currentUserId: number;
  otherUserName: string;
  destinatarioId: number | null; // ID do usuário que deve receber a notificação
}

const Chat: React.FC<ChatProps> = ({ conversaId, currentUserId, otherUserName, destinatarioId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Usa o socket global do nosso Contexto em vez de criar um novo
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const room = `conversa_${conversaId}`;
    socket.emit('join_room', { room });

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/api/conversa/${conversaId}/mensagens`);
        setMessages(response.data);
      } catch (error) {
        console.error("Erro ao buscar histórico de mensagens", error);
      }
    };
    fetchHistory();

    const handleReceiveMessage = (message: Message) => {
      if (message.conversa_id === conversaId) {
          setMessages(prevMessages => [...prevMessages, message]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [conversaId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        conteudo: newMessage,
        conversa_id: conversaId,
        remetente_id: currentUserId,
        destinatario_id: destinatarioId
      };
      socket.emit('send_message', messageData);
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