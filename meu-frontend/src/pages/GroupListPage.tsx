// src/pages/GroupListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GroupListPage.css';
import { FaCopy } from 'react-icons/fa';

// Interface atualizada para incluir o criador_id
interface Group {
  id: number;
  nome: string;
  pin_convite: string;
  criador_id: number;
}

const GroupListPage: React.FC = () => {
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setCurrentUserId(JSON.parse(userData).id);
    }

    const fetchGroups = async () => {
      try {
        const response = await api.get('/group/my-groups');
        setGrupos(response.data.grupos_do_usuario);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
        setErro('Erro ao carregar grupos. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    };
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este grupo? Esta ação é irreversível e apagará todas as solicitações e ofertas do grupo.")) {
      try {
        await api.delete(`/group/${groupId}`);
        alert("Grupo deletado com sucesso.");
        setGrupos(grupos.filter(g => g.id !== groupId));
      } catch (error) {
        alert("Erro ao deletar o grupo.");
      }
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    if (window.confirm("Tem certeza que deseja sair deste grupo?")) {
      try {
        await api.post(`/group/${groupId}/leave`);
        alert("Você saiu do grupo com sucesso.");
        setGrupos(grupos.filter(g => g.id !== groupId));
      } catch (error) {
        alert("Erro ao sair do grupo.");
      }
    }
  };

  const handleCopyPin = (pin: string, groupId: number) => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopiedPinId(groupId);
      setTimeout(() => setCopiedPinId(null), 2000);
    });
  };

  if (carregando) return <div className="container">Carregando seus grupos...</div>;
  if (erro) return <div className="container">{erro}</div>;

  return (
    <div className="group-list-page">
      <header className="page-header">
        <h1>Meus Grupos</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/groups/create')}>Criar Novo Grupo</button>
          <button className="btn-secondary" onClick={() => navigate('/groups/join')}>Entrar em um Grupo</button>
        </div>
      </header>

      {grupos.length > 0 ? (
        <ul className="groups-list">
          {grupos.map(group => {
            const isCreator = group.criador_id === currentUserId;
            return (
              <li key={group.id} className="group-item">
                <div className="group-item-header">
                  <h3>{group.nome}</h3>
                </div>
                <div className="group-item-body">
                  <p>PIN para convidar:</p>
                  <div className="pin-container">
                    <span className="pin-code">{group.pin_convite}</span>
                    {copiedPinId === group.id ? (
                      <span className="copy-feedback">Copiado!</span>
                    ) : (
                      <button className="copy-button" title="Copiar PIN" onClick={() => handleCopyPin(group.pin_convite, group.id)}>
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </div>
                <div className="group-item-footer">
                  <button onClick={() => navigate(`/groups/${group.id}`)}>Ver Mural</button>
                  {isCreator ? (
                    <div className="creator-actions">
                      <button className="btn-warning" onClick={() => navigate(`/groups/${group.id}/edit`)}>Editar</button>
                      <button className="btn-danger" onClick={() => handleDeleteGroup(group.id)}>Deletar</button>
                    </div>
                  ) : (
                    <button className="btn-danger" onClick={() => handleLeaveGroup(group.id)}>Sair do Grupo</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="no-groups-message">
          <h2>Bem-vindo(a) ao VizinhoAmigo!</h2>
          <p>Você ainda não faz parte de nenhum grupo. Crie um para o seu condomínio ou junte-se a um existente.</p>
        </div>
      )}
    </div>
  );
};

export { GroupListPage };