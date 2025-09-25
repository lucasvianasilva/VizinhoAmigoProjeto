// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { FaThLarge, FaTasks, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { notifications, clearNotifications } = useSocket();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };
    
    const handleBellClick = () => {
        if (notifications.length > 0) {
            alert(`Você tem ${notifications.length} nova(s) notificação(ões):\n- ${notifications[0].message}`);
            clearNotifications();
        } else {
            alert("Nenhuma notificação nova.");
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-logo">VizinhoAmigo</h1>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/groups" className="nav-link">
                    <FaThLarge /><span>Meus Grupos</span>
                </NavLink>
                <NavLink to="/my-activities" className="nav-link">
                    <FaTasks /><span>Minhas Atividades</span>
                </NavLink>
                <NavLink to="/profile/edit" className="nav-link">
                    <FaUser /><span>Meu Perfil</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <div className="notification-bell" onClick={handleBellClick}>
                    <FaBell />
                    {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                </div>
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /><span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export { Sidebar };