// src/pages/EditRequestPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIAS_VALIDAS = [
    "Pequenos Reparos", "Cuidar de Pets", "Doações", "Ajuda com Compras",
    "Transporte/Carona", "Itens Emprestados", "Outros"
];

const EditRequestPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS_VALIDAS[0]);
    const [urgencia, setUrgencia] = useState('normal');
    const [carregando, setCarregando] = useState(false);
    
    useEffect(() => {
        const fetchRequestData = async () => {
            try {
                const response = await api.get(`/api/solicitacoes/${id}`);
                const { titulo, descricao, categoria, urgencia } = response.data;
                setTitulo(titulo);
                setDescricao(descricao);
                setCategoria(categoria);
                setUrgencia(urgencia);
            } catch (error) {
                alert("Erro ao carregar dados da solicitação.");
                navigate(-1);
            }
        };
        fetchRequestData();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);
        try {
            await api.put(`/api/solicitacoes/${id}`, { titulo, descricao, categoria, urgencia });
            alert('Solicitação atualizada com sucesso!');
            navigate(`/solicitacao/${id}`, { state: { type: 'solicitacao' } });
        } catch (error) {
            alert('Erro ao atualizar solicitação.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="container">
            <h1>Editar Solicitação</h1>
            <form onSubmit={handleSubmit}>
                <div><label>Título:</label><input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required /></div>
                <div><label>Descrição:</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} required /></div>
                <div><label>Categoria:</label><select value={categoria} onChange={e => setCategoria(e.target.value)}>{CATEGORIAS_VALIDAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label>Nível de Urgência:</label><select value={urgencia} onChange={e => setUrgencia(e.target.value)}><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="urgente">Urgente</option></select></div>
                <button type="submit" disabled={carregando}>{carregando ? 'Salvando...' : 'Salvar Alterações'}</button>
            </form>
        </div>
    );
};

export { EditRequestPage };