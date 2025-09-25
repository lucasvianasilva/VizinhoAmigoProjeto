// src/pages/MyActivitiesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import './MyActivitiesPage.css';

// --- CORREÇÃO: Usando as interfaces específicas em vez da genérica ---
interface Solicitacao {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  urgencia?: string;
  solicitante_id: number;
}

interface Oferta {
    id: number;
    titulo: string;
    descricao: string;
    categoria: string;
    status: string;
    ofertante_id: number;
}

const MyActivitiesPage: React.FC = () => {
    const navigate = useNavigate();
    // --- CORREÇÃO: Atualizando o tipo do estado ---
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [activeTab, setActiveTab] = useState<'solicitacoes' | 'ofertas'>('solicitacoes');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.get('/api/my-activities');
                setSolicitacoes(response.data.solicitacoes);
                setOfertas(response.data.ofertas);
            } catch (error) {
                console.error("Erro ao buscar minhas atividades", error);
                alert("Não foi possível carregar suas atividades.");
            } finally {
                setCarregando(false);
            }
        };
        fetchActivities();
    }, []);

    if (carregando) {
        return <div className="container">Carregando suas atividades...</div>;
    }

    // A lógica abaixo continua a mesma, mas agora com os tipos corretos
    const itemsToShow = activeTab === 'solicitacoes' ? solicitacoes : ofertas;
    const typeToShow = activeTab === 'solicitacoes' ? 'solicitacao' : 'oferta';

    return (
        <div className="container my-activities-container">
            <h1>Minhas Atividades</h1>
            <button className="btn-tertiary" onClick={() => navigate('/groups')}>Voltar para Grupos</button>

            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'solicitacoes' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('solicitacoes')}
                >
                    Minhas Solicitações ({solicitacoes.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'ofertas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ofertas')}
                >
                    Minhas Ofertas ({ofertas.length})
                </button>
            </div>

            <div className="activities-list">
                {itemsToShow.length > 0 ? (
                    itemsToShow.map(item => (
                        <Link
                            key={item.id}
                            to={`/${typeToShow}/${item.id}`}
                            state={{ type: typeToShow }}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <ActivityCard item={item} type={typeToShow} />
                        </Link>
                    ))
                ) : (
                    <p>Você ainda não criou nenhuma {activeTab === 'solicitacoes' ? 'solicitação' : 'oferta'}.</p>
                )}
            </div>
        </div>
    );
};

export { MyActivitiesPage };