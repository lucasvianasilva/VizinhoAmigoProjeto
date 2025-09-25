// src/pages/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard'; // Reutilizamos nosso componente de card!

interface HistoricoItem {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  urgencia?: string;
  status: string;
  solicitante_id: number;
}

const HistoryPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/api/grupos/${groupId}/historico`);
        setHistorico(response.data.historico);
      } catch (error) {
        setErro("Não foi possível carregar o histórico.");
      } finally {
        setCarregando(false);
      }
    };
    fetchHistory();
  }, [groupId]);

  if (carregando) return <div>Carregando histórico...</div>;
  if (erro) return <div>{erro}</div>;

  return (
    <div className="container">
      <h1>Histórico de Tarefas Concluídas</h1>
      <button onClick={() => navigate(`/groups/${groupId}`)}>Voltar ao Mural</button>

      <div style={{ marginTop: '20px' }}>
        {historico.length > 0 ? (
          historico.map(item => (
            // Usamos o Link para que o usuário possa ver os detalhes e a avaliação, se quiser
            <Link 
              key={`hist-${item.id}`} 
              to={`/solicitacao/${item.id}`} 
              state={{ type: 'solicitacao' }} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ActivityCard item={item} type="solicitacao" />
            </Link>
          ))
        ) : (
          <p>Nenhuma atividade foi concluída neste grupo ainda.</p>
        )}
      </div>
    </div>
  );
};

export { HistoryPage };