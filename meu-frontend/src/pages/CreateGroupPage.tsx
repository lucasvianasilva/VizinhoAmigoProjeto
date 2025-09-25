// src/pages/CreateGroupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateGroupPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await api.post('/group/create', { nome });
      alert('Grupo criado com sucesso!');
      navigate('/groups'); // Corrigido para a rota correta
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error.response?.data || error.message);
      setErro(`Erro ao criar grupo: ${error.response?.data?.message || 'Tente novamente.'}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h1>Criar Novo Grupo</h1>
      {erro && <div style={{ color: 'red' }}>{erro}</div>}
      <form onSubmit={handleCreateGroup}>
        <div>
          <label>Nome do Grupo:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={carregando}
          />
        </div>
        <button type="submit" disabled={carregando}>
          {carregando ? 'Criando...' : 'Criar Grupo'}
        </button>
      </form>
    </div>
  );
};

export {CreateGroupPage};