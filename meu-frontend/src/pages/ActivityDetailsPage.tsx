// src/pages/ActivityDetailsPage.tsx - Versão Final, Completa e Corrigida
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './ActivityDetailsPage.css';
import Chat from '../components/Chat';

// --- Interfaces ---
interface UserDetails {
  id: number;
  nome: string;
  telefone?: string;
  horarios_disponiveis?: string;
  info_contato?: string;
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
  ofertante_id?: number;
  ofertante?: UserDetails;
  solicitante?: UserDetails;
}

interface ChatParticipant {
  id: number;
  nome: string;
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
  const type = location.state?.type as 'oferta' | 'solicitacao';
  const navigate = useNavigate();

  // --- Estados ---
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [showChat, setShowChat] = useState(false);
  const [conversaId, setConversaId] = useState<number | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [helperId, setHelperId] = useState<string>('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // --- Effect para buscar dados ---
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) { setCurrentUserId(JSON.parse(userData).id); }
    if (!id || !type) { setErro("Informações faltando."); setCarregando(false); return; }
    
    const endpoint = type === 'solicitacao' ? `/api/solicitacoes/${id}` : `/api/ofertas/${id}`;
    
    const fetchActivityDetails = async () => {
      try {
        const response = await api.get<ActivityDetails>(endpoint);
        setActivity(response.data);
      } catch (error: any) {
        setErro(`Erro ao carregar detalhes: ${error.response?.data?.message || 'Tente novamente'}`);
      } finally {
        setCarregando(false);
      }
    };
    fetchActivityDetails();
  }, [id, type]);

  // --- Funções Handler ---
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUpdateOfferStatus = async (newStatus: string) => {
    const confirmMessage = newStatus === 'encerrada'
      ? "Tem certeza que deseja encerrar esta oferta? Ela não será mais visível no mural."
      : `Deseja alterar o status para "${newStatus}"?`;
    if (window.confirm(confirmMessage)) {
        try {
            await api.put(`/api/ofertas/${id}`, { status: newStatus });
            setActivity(prev => prev ? { ...prev, status: newStatus } : null);
            alert(`Oferta atualizada com sucesso!`);
            if (newStatus === 'encerrada') {
                navigate(`/groups/${activity?.grupo_id}`);
            }
        } catch(error) {
            alert("Erro ao atualizar o status da oferta.");
        }
    }
  };
  
  const handleDeleteRequest = async () => {
    if(window.confirm("Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.")){
        try {
            await api.delete(`/api/solicitacoes/${id}`);
            alert("Solicitação excluída com sucesso!");
            navigate(`/groups/${activity?.grupo_id}`);
        } catch(error){
            alert("Erro ao excluir solicitação.");
        }
    }
  };

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
        const otherUserIds = [...new Set(
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
          setOtherUserId(null);
        }
      }
      setShowChat(true);
    } catch (error) {
      alert("Não foi possível iniciar a conversa.");
    }
  };

  const handleMarkAsComplete = async () => {
    let convId = conversaId;
    if (!convId) {
        try {
            const response = await api.get(`/api/solicitacao/${id}/conversa`);
            convId = response.data.id;
            setConversaId(convId);
        } catch (error) {
            alert("Não foi possível encontrar a conversa. Por favor, abra o chat uma vez.");
            return;
        }
    }
    const msgsResponse = await api.get<ApiMessage[]>(`/api/conversa/${convId}/mensagens`);
    const uniqueIds = [...new Set(msgsResponse.data.map(msg => msg.remetente_id))];
    const participantData: ChatParticipant[] = [];
    for (const pId of uniqueIds) {
      if (pId !== currentUserId) {
        const userResp = await api.get<ChatParticipant>(`/api/user/${pId}`);
        participantData.push(userResp.data);
      }
    }
    setParticipants(participantData);
    setIsCompleting(true);
  };

  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperId) { alert("Por favor, selecione quem te ajudou."); return; }
    try {
      await api.post(`/api/solicitacoes/${id}/concluir`, { ajudante_id: parseInt(helperId) });
      setIsCompleting(false);
      setShowRatingForm(true);
    } catch (error) { alert("Erro ao concluir a tarefa."); }
  };

  const handleSendRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert("Por favor, selecione uma nota."); return; }
    try {
      await api.post('/api/avaliacoes', {
        solicitacao_id: id,
        avaliado_id: parseInt(helperId),
        nota: rating,
        comentario: comment,
      });
      alert("Avaliação enviada! Obrigado.");
      setShowRatingForm(false);
      setActivity(prev => prev ? { ...prev, status: 'atendida' } : null);
    } catch (error) { alert("Erro ao enviar avaliação."); }
  };

  // --- Lógica de Renderização ---
  if (carregando) return <div className="container">Carregando...</div>;
  if (erro) return <div className="container">{erro}</div>;
  if (!activity) return <div className="container">Atividade não encontrada.</div>;

  const isOwner = type === 'solicitacao' 
    ? currentUserId === activity.solicitante_id
    : currentUserId === (activity.ofertante_id || activity.ofertante?.id);

  return (
    <div className="container activity-details-container">
      <span className={`status-badge status-${activity.status}`}>{activity.status}</span>
      <h1>{activity.titulo}</h1>
      <p className="category-badge">{activity.categoria}</p>
      <div className="details-body"><p>{activity.descricao}</p></div>

      {type === 'oferta' && activity.ofertante && (
        <div className="contact-section">
          <h3>Informações de Contato</h3>
          <p><strong>Oferecido por:</strong> {activity.ofertante.nome}</p>
          {activity.ofertante.telefone && (
            <div className="contact-item">
              <span><strong>Telefone:</strong> {activity.ofertante.telefone}</span>
              <button onClick={() => handleCopy(activity.ofertante!.telefone!)}>{copied ? "Copiado!" : "Copiar"}</button>
            </div>
          )}
          {activity.ofertante.horarios_disponiveis && <p><strong>Horários:</strong> {activity.ofertante.horarios_disponiveis}</p>}
          {activity.ofertante.info_contato && <p><strong>Como contatar:</strong> {activity.ofertante.info_contato}</p>}
        </div>
      )}

      <div className="details-actions">
        {type === 'solicitacao' && activity.status === 'pendente' && (
          <>
            {!isOwner && !showChat && ( <button className="btn-secondary" onClick={handleStartChat}>Oferecer Ajuda</button> )}
            {isOwner && !showChat && ( <button className="btn-secondary" onClick={handleStartChat}>Ver Chat</button> )}
            {isOwner && ( <button className="btn-primary" onClick={handleMarkAsComplete}>Marcar como Concluída</button> )}
            {isOwner && (
                <>
                    <button className="btn-warning" onClick={() => navigate(`/solicitacao/${id}/edit`)}>Editar</button>
                    <button className="btn-danger" onClick={handleDeleteRequest}>Excluir</button>
                </>
            )}
          </>
        )}
        {type === 'oferta' && isOwner && activity.status !== 'encerrada' && (
          <>
            <button className="btn-danger" onClick={() => handleUpdateOfferStatus('encerrada')}>Encerrar Oferta</button>
            {activity.status === 'disponivel' && (
              <button className="btn-warning" onClick={() => handleUpdateOfferStatus('em andamento')}>Marcar como "Em Uso"</button>
            )}
            {activity.status === 'em andamento' && (
              <button className="btn-primary" onClick={() => handleUpdateOfferStatus('disponivel')}>Marcar como "Disponível"</button>
            )}
          </>
        )}
        <button className="btn-tertiary" onClick={() => navigate(-1)}>Voltar</button>
      </div>

      {isCompleting && (
        <form onSubmit={handleConfirmCompletion} className="completion-form">
          <h3>Quem te ajudou?</h3>
          {participants.length > 0 ? (
            <select value={helperId} onChange={e => setHelperId(e.target.value)} required>
              <option value="">Selecione um vizinho</option>
              {participants.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          ) : ( <p>Nenhum vizinho participou da conversa ainda.</p> )}
          <button type="submit" disabled={participants.length === 0}>Confirmar e Avaliar</button>
        </form>
      )}

      {showRatingForm && (
        <form onSubmit={handleSendRating} className="rating-form">
          <h3>Avalie a ajuda de {participants.find(p => p.id === parseInt(helperId))?.nome}</h3>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(starValue => (
              <button
                type="button"
                key={starValue}
                className={starValue <= rating ? 'on' : 'off'}
                onClick={() => setRating(starValue)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea placeholder="Deixe um comentário (opcional)..." value={comment} onChange={e => setComment(e.target.value)} />
          <button type="submit">Enviar Avaliação</button>
        </form>
      )}

      {showChat && conversaId && currentUserId && otherUserId && (
        <Chat conversaId={conversaId} currentUserId={currentUserId} otherUserName={otherUserName} destinatarioId={otherUserId} />
      )}
    </div>
  );
};

export { ActivityDetailsPage };