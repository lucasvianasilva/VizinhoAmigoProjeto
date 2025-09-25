// src/pages/GroupDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './GroupDetailsPage.css'

// Importando nosso novo componente de Card
import ActivityCard from '../components/ActivityCard'; 

// Atualizando as interfaces para corresponder às mudanças do backend
interface Oferta {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string; // Mudou de 'tipo' para 'categoria'
  status: string;
  ofertante_id: number;
  grupo_id: number;
}

interface Solicitacao {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string; // Mudou de 'tipo' para 'categoria'
  urgencia?: string; // Campo novo
  status: string;
  solicitante_id: number;
  grupo_id: number;
}

const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      // ... (o resto da função useEffect continua igual)
      if (!groupId) {
        setErro("ID do grupo não encontrado.");
        setCarregando(false);
        return;
      }

      try {
        const ofertasResponse = await api.get(`/api/grupos/${groupId}/ofertas`);
        setOfertas(ofertasResponse.data.ofertas);

        const solicitacoesResponse = await api.get(`/api/grupos/${groupId}/solicitacoes`);
        setSolicitacoes(solicitacoesResponse.data.solicitacoes);

      } catch (error: any) {
        console.error("Erro ao buscar dados do grupo:", error.response?.data || error.message);
        if (error.response?.status === 403) {
            setErro("Você não tem permissão para acessar este grupo.");
        } else {
            setErro("Erro ao carregar os dados do grupo. Tente novamente.");
        }
      } finally {
        setCarregando(false);
      }
    };
    fetchGroupData();
  }, [groupId]);

  if (carregando) {
    return <div>Carregando dados do grupo...</div>;
  }

  if (erro) {
    return <div><p>{erro}</p><button onClick={() => navigate('/groups')}>Voltar para Meus Grupos</button></div>;
  }

  return (
    <div className="container">
      <div className="details-header">
        <h1>Mural do Grupo</h1>
        <div className="details-header-actions">
          <button className="btn-tertiary" onClick={() => navigate('/groups')}>Voltar</button>
          <button className="btn-secondary" onClick={() => navigate(`/groups/${groupId}/history`)}>Ver Histórico</button>
          <button className="btn-primary" onClick={() => navigate('/create', { state: { groupId: groupId } })}>+ Nova Postagem</button>
        </div>
      </div>

      <div className="mural-container" style={{ marginTop: '20px' }}>
        {/* Seção de Solicitações */}
        <h2>Pedidos de Ajuda ({solicitacoes.length})</h2>
        {solicitacoes.length > 0 ? (
          solicitacoes.map(solicitacao => (
            <Link 
              key={`sol-${solicitacao.id}`} 
              to={`/solicitacao/${solicitacao.id}`} 
              state={{ type: 'solicitacao' }} 
              style={{ textDecoration: 'none', color: 'inherit' }} 
            >
              <ActivityCard item={solicitacao} type="solicitacao" />
            </Link>
          ))
        ) : (
          <p>Nenhum pedido de ajuda no momento.</p>
        )}

        <hr style={{ margin: '40px 0' }} />

        {/* Seção de Ofertas */}
        <h2>Vizinhos Oferecendo Ajuda ({ofertas.length})</h2>
        {ofertas.length > 0 ? (
          ofertas.map(oferta => (
            <Link 
              key={`of-${oferta.id}`} 
              to={`/oferta/${oferta.id}`} 
              state={{ type: 'oferta' }} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ActivityCard item={oferta} type="oferta" />
            </Link>
          ))
        ) : (
          <p>Nenhuma oferta de ajuda disponível no momento.</p>
        )}
      </div>
    </div>
  );
};

export { GroupDetailsPage };