// src/pages/ActivityDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './ActivityDetailsPage.css';
import Chat from '../components/Chat';

// --- Interfaces ---
interface UserDetails {
  id: number;
  nome: string;
}

interface ActivityDetails {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  grupo_id: number;
  urgencia?: string;
  solicitante_id?: number;
  solicitante?: UserDetails;
}

interface ApiMessage {
    id: number;
    conteudo: string;
    remetente_id: number;
}

// --- Componente Principal ---
const ActivityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const type = location.state?.type as 'solicitacao'; // Simplificado para focar no fluxo de solicitação
  const navigate = useNavigate();

  // --- Estados ---
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showChat, setShowChat] = useState(false);
  const [conversaId, setConversaId] = useState<number | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [otherUserId, setOtherUserId] = useState<number | null>(null);

  // ... (outros estados para conclusão e avaliação que você já tem)

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) { setCurrentUserId(JSON.parse(userData).id); }
    if (!id || !type) { setCarregando(false); return; }
    const endpoint = `/api/solicitacoes/${id}`;
    const fetchActivityDetails = async () => {
      try {
        const response = await api.get(endpoint);
        setActivity(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar detalhes', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchActivityDetails();
  }, [id, type]);

  const handleStartChat = async () => {
    if (!id || !activity || !currentUserId) return;
    try {
      const response = await api.get(`/api/solicitacao/${id}/conversa`);
      const convId = response.data.id;
      setConversaId(convId);

      const solicitanteId = activity.solicitante_id!;
      
      if (currentUserId !== solicitanteId) {
        setOtherUserName(activity.solicitante?.nome || 'Solicitante');
        setOtherUserId(solicitanteId);
      } else {
        const msgsResponse = await api.get<ApiMessage[]>(`/api/conversa/${convId}/mensagens`);
        const otherUserIds: number[] = [...new Set(
          msgsResponse.data
            .map(msg => Number(msg.remetente_id))
            .filter(uid => uid !== currentUserId)
        )];
        if (otherUserIds.length > 0) {
          const ajudanteId = otherUserIds[0];
          const userResponse = await api.get(`/api/user/${ajudanteId}`);
          setOtherUserName(userResponse.data.nome);
          setOtherUserId(ajudanteId);
        } else {
          setOtherUserName('Aguardando vizinho...');
          // Importante: Mesmo sem ajudante, o dono precisa de um destinatário temporário para o chat funcionar.
          // Podemos definir como ele mesmo, o backend não enviará notificação para si mesmo.
          setOtherUserId(currentUserId); 
        }
      }
      setShowChat(true);
    } catch (error) {
      alert("Não foi possível iniciar a conversa.");
    }
  };

  // ... (demais funções handle... que você já tem)

  if (carregando) return <div className="container">Carregando...</div>;
  if (!activity) return <div className="container">Atividade não encontrada.</div>;

  const isOwner = currentUserId === activity.solicitante_id;

  return (
    <div className="container activity-details-container">
      {/* ... (cabeçalho da atividade) ... */}

      <div className="details-actions">
         {activity.status === 'pendente' && !isOwner && !showChat && ( <button className="btn-secondary" onClick={handleStartChat}>Oferecer Ajuda</button> )}
         {activity.status === 'pendente' && isOwner && !showChat && ( <button className="btn-secondary" onClick={handleStartChat}>Ver Chat</button> )}
         <button className="btn-tertiary" onClick={() => navigate(-1)}>Voltar</button>
      </div>

      {/* ... (formulários de conclusão, etc.) ... */}

      {/* CORREÇÃO: Renderiza o chat mesmo que otherUserId não esteja definido no primeiro momento para o dono */}
      {showChat && conversaId && currentUserId && (
        <Chat 
          conversaId={conversaId} 
          currentUserId={currentUserId} 
          otherUserName={otherUserName}
          // Garante que destinatarioId nunca seja nulo ao passar para o Chat
          destinatarioId={otherUserId!} 
        />
      )}
    </div>
  );
};

export { ActivityDetailsPage };