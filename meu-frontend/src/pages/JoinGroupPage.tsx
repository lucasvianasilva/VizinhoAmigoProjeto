// src/pages/JoinGroupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const JoinGroupPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      // CORREÇÃO: A URL agora é '/group/join' e o payload é { pin }
      await api.post('/group/join', { pin });
      alert('Você entrou no grupo com sucesso!');
      navigate('/groups'); 
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error.response?.data || error.message);
      setErro(`Erro ao entrar no grupo: ${error.response?.data?.message || 'Tente novamente.'}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h1>Entrar em um Grupo</h1>
      <p>Insira o PIN de convite que você recebeu para se juntar a um grupo.</p>
      <form onSubmit={handleJoinGroup}>
        <div>
          <label>PIN de Convite:</label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            maxLength={6}
          />
        </div>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar no Grupo'}
        </button>
      </form>
    </div>
  );
};

export { JoinGroupPage };