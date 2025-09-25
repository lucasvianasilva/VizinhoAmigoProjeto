// src/pages/EditGroupPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditGroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [nome, setNome] = useState('');

    useEffect(() => {
        // Busca o nome atual do grupo para pré-preencher o campo
        const fetchGroup = async () => {
            // Nota: Precisamos de uma rota GET para detalhes do grupo se não tivermos.
            // Por enquanto, vamos assumir que o nome pode ser passado ou buscado.
            // Para simplificar, o usuário irá apenas digitar o novo nome.
        };
        fetchGroup();
    }, [groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/group/${groupId}`, { nome });
            alert('Grupo atualizado com sucesso!');
            navigate('/groups');
        } catch (error) {
            alert('Erro ao atualizar o grupo.');
        }
    };

    return (
        <div className="container">
            <h1>Editar Nome do Grupo</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Novo nome do grupo:</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                <button type="submit">Salvar Alterações</button>
            </form>
        </div>
    );
};

export { EditGroupPage };