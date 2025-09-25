// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

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
        const newSocket = io('http://localhost:5000');
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
            // Opcional: Tocar um som de notificação
            // new Audio('/path/to/notification.mp3').play();
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