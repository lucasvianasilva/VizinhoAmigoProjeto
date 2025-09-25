// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    // ... sua função handleLogin continua a mesma ...
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('userData', JSON.stringify(response.data.usuario));
      navigate('/groups');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-container container">
      <div className="logo-container">
        <h1 className="logo-text">VizinhoAmigo</h1>
      </div>
      <p>Acesse sua conta para continuar.</p>
      
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={carregando}/>
        <input type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={carregando}/>
        {erro && <p style={{ color: '#dc3545' }}>{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <p>Não tem uma conta? <Link to="/register">Registre-se</Link></p>
      </div>
    </div>
  );
};

export { LoginPage };