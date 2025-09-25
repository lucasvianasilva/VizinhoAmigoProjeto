// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Lê a URL base da mesma variável de ambiente
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface INotification {
    message: string;
    conversa_id: number;
}

interface SocketContextType {
    socket: Socket | null;
    notifications: INotification[];
    clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<INotification[]>([]);

    useEffect(() => {
        // Usa a URL correta para a conexão
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const userId = JSON.parse(userData).id;
                newSocket.emit('register_user', { user_id: userId });
            }
        });

        newSocket.on('new_notification', (notification: INotification) => {
            setNotifications(prev => [...prev, notification]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    const value = useMemo(() => ({
        socket,
        notifications,
        clearNotifications
    }), [socket, notifications]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};