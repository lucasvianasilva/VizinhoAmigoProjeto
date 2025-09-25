// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// CORREÇÃO: O 'Outlet' foi removido desta linha de importação
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando todos os componentes de página...
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GroupListPage } from './pages/GroupListPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { JoinGroupPage } from './pages/JoinGroupPage';
import { CreateOfferRequestPage } from './pages/CreateOfferRequestPage';
import { ActivityDetailsPage } from './pages/ActivityDetailsPage';
import { HistoryPage } from './pages/HistoryPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { EditRequestPage } from './pages/EditRequestPage';
import { MyActivitiesPage } from './pages/MyActivitiesPage';
import { EditGroupPage } from './pages/EditGroupPage';

// Importando o Contexto e o NOVO Layout
import { SocketProvider } from './context/SocketContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import './index.css';

const App = () => {
  return (
    <Routes>
      {/* Rotas Públicas (fora do layout do dashboard) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas Protegidas (dentro do layout do dashboard) */}
      <Route element={<DashboardLayout />}>
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/join" element={<JoinGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="/groups/:groupId/history" element={<HistoryPage />} />
        
        <Route path="/create" element={<CreateOfferRequestPage />} />
        
        <Route path="/solicitacao/:id" element={<ActivityDetailsPage />} />
        <Route path="/solicitacao/:id/edit" element={<EditRequestPage />} />
        <Route path="/oferta/:id" element={<ActivityDetailsPage />} />

        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/my-activities" element={<MyActivitiesPage />} />
        <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
      </Route>
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <Router>
        <App />
      </Router>
    </SocketProvider>
  </React.StrictMode>,
);