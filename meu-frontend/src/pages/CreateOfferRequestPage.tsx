// src/pages/CreateOfferRequestPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';


const CATEGORIAS_VALIDAS = [
    "Pequenos Reparos", "Cuidar de Pets", "Doações", "Ajuda com Compras",
    "Transporte/Carona", "Itens Emprestados", "Outros"
];

const CreateOfferRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acessar o estado da rota

  // Pega o groupId que passamos a partir da página de detalhes
  const groupId = location.state?.groupId;

  const [tipoPost, setTipoPost] = useState<'oferta' | 'solicitacao'>('solicitacao');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_VALIDAS[0]);
  const [urgencia, setUrgencia] = useState('normal');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Efeito que verifica se o groupId existe. Se não, redireciona o usuário.
  useEffect(() => {
    if (!groupId) {
      alert("Para criar uma postagem, você precisa estar dentro de um grupo primeiro.");
      navigate('/groups');
    }
  }, [groupId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const payload: any = {
      titulo, descricao, categoria,
      grupo_id: parseInt(groupId, 10), // Usa o ID recebido
    };

    if (tipoPost === 'solicitacao') {
      payload.urgencia = urgencia;
    }

    const endpoint = tipoPost === 'oferta' ? '/api/ofertas' : '/api/solicitacoes';
    const successMessage = tipoPost === 'oferta' ? 'Oferta criada com sucesso!' : 'Solicitação criada com sucesso!';

    try {
      await api.post(endpoint, payload);
      alert(successMessage);
      navigate(`/groups/${groupId}`); // Volta para a página do grupo
    } catch (error: any) {
      setErro(`Erro ao criar: ${error.response?.data?.message || 'Tente novamente.'}`);
    } finally {
      setCarregando(false);
    }
  };

  // Se groupId ainda não carregou, não renderiza o formulário para evitar erros
  if (!groupId) {
    return <div>Redirecionando...</div>;
  }

  return (
    <div className="container"> {/* Usando a classe de container global */}
      <h1>Criar Nova {tipoPost === 'oferta' ? 'Oferta de Ajuda' : 'Solicitação'}</h1>
      
      <div className="toggle-buttons">
        {/* Estilos para estes botões serão adicionados no index.css */}
        <button onClick={() => setTipoPost('solicitacao')} className={tipoPost === 'solicitacao' ? 'active' : ''}>
          Preciso de Ajuda
        </button>
        <button onClick={() => setTipoPost('oferta')} className={tipoPost === 'oferta' ? 'active' : ''}>
          Quero Ajudar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* O seletor de grupo foi removido, tornando a UI mais limpa! */}
        <div>
          <label>Título:</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>
        <div>
          <label>Categoria:</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS_VALIDAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {tipoPost === 'solicitacao' && (
          <div>
            <label>Nível de Urgência:</label>
            <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        )}
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
};

export { CreateOfferRequestPage };