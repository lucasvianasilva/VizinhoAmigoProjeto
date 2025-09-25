// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Criaremos este arquivo para estilos específicos

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      {/* Nova seção da Logo */}
      <div className="logo-container">
        <h1 className="logo-text">VizinhoAmigo</h1>
      </div>

      <header className="home-header">
        <h2>Conectando vizinhos, fortalecendo comunidades.</h2>
        <p>Troque favores, compartilhe recursos e construa um condomínio mais unido e solidário.</p>
      </header>
      
      {/* O resto do conteúdo permanece o mesmo */}
      <section className="home-features">
        <h3>O que você pode fazer?</h3>
        <div className="features-list">
          <div className="feature-item">
            <h4>Fazer uma Solicitação</h4>
            <p>Precisa de uma ferramenta emprestada ou de ajuda com uma tarefa? Publique um pedido.</p>
          </div>
          <div className="feature-item">
            <h4>Oferecer Ajuda</h4>
            <p>Tem algo para emprestar ou um serviço que pode oferecer? Compartilhe com seus vizinhos.</p>
          </div>
          <div className="feature-item">
            <h4>Participar de Grupos</h4>
            <p>Junte-se ao grupo do seu condomínio para interagir e ver as novidades da sua área.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>Pronto para começar?</p>
        <Link to="/login" className="btn-call-to-action">
          Entrar ou Cadastrar
        </Link>
      </footer>
    </div>
  );
};

export { HomePage };