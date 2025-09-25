// src/components/ActivityCard.tsx
import React from 'react';
import './ActivityCard.css'; // Vamos criar este arquivo de estilo a seguir

// Importando ícones da biblioteca que instalamos
import { FaTools, FaPaw, FaGift, FaShoppingCart, FaCar, FaHandsHelping, FaQuestionCircle } from 'react-icons/fa';

// Interfaces para os tipos de dados que o card pode receber
interface Solicitacao {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  urgencia?: string;
  status: string;
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

// Mapeamento de categorias para ícones
const categoryIcons: { [key: string]: React.ReactElement } = {
  "Pequenos Reparos": <FaTools />,
  "Cuidar de Pets": <FaPaw />,
  "Doações": <FaGift />,
  "Ajuda com Compras": <FaShoppingCart />,
  "Transporte/Carona": <FaCar />,
  "Itens Emprestados": <FaHandsHelping />,
  "Outros": <FaQuestionCircle />,
};

// Props do nosso componente
type ActivityCardProps = {
  item: Solicitacao | Oferta;
  type: 'solicitacao' | 'oferta';
};

const ActivityCard: React.FC<ActivityCardProps> = ({ item, type }) => {
  const isSolicitacao = type === 'solicitacao';
  // Acessa a propriedade 'urgencia' apenas se for uma solicitação
  const urgencia = isSolicitacao ? (item as Solicitacao).urgencia : undefined;

  return (
    <div className={`card-container card-${type}`}>
      <div className="card-header">
        <div className="card-icon">{categoryIcons[item.categoria] || <FaQuestionCircle />}</div>
        <h3 className="card-title">{item.titulo}</h3>
        {isSolicitacao && urgencia && <span className={`urgency-tag urgency-${urgencia}`}>{urgencia}</span>}
        {type === 'oferta' && item.status === 'em andamento' && (
        <span className="status-tag status-in-progress">Em Uso</span>
        )}
      </div>
      <div className="card-body">
        <p>{item.descricao}</p>
      </div>
      <div className="card-footer">
        <span className="card-category">{item.categoria}</span>
        <span className={`card-status status-${item.status}`}>{item.status}</span>
      </div>
    </div>
  );
};

export default ActivityCard;