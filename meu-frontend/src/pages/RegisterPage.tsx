// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    // ... sua função handleRegister continua a mesma ...
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await api.post('/auth/register', { nome, email, senha });
      navigate('/login');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-container container">
      <div className="logo-container">
        <h1 className="logo-text">VizinhoAmigo</h1>
      </div>
      <p>Crie sua conta para começar a colaborar.</p>
      
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={carregando}/>
        <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={carregando}/>
        <input type="password" placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={carregando}/>
        {erro && <p style={{ color: '#dc3545' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Criando conta...' : 'Registrar'}</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <p>Já tem uma conta? <Link to="/login">Faça Login</Link></p>
      </div>
    </div>
  );
};

export { RegisterPage };