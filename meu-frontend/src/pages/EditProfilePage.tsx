// src/pages/EditProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface UserProfile {
    nome: string;
    email: string;
    telefone?: string;
    horarios_disponiveis?: string;
    info_contato?: string;
}

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        // Carrega os dados do usuário do localStorage para pré-preencher o formulário
        const userData = localStorage.getItem('userData');
        if (userData) {
            setProfile(JSON.parse(userData));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setCarregando(true);
        try {
            const response = await api.put('/auth/profile', profile);
            alert('Perfil atualizado com sucesso!');
            // Atualiza os dados do usuário no localStorage com as novas informações
            localStorage.setItem('userData', JSON.stringify(response.data.usuario));
            navigate('/groups'); // Volta para a lista de grupos
        } catch (error) {
            alert('Erro ao atualizar o perfil. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    };

    if (!profile) {
        return <div className="container">Carregando perfil...</div>;
    }

    return (
        <div className="container">
            <h1>Editar Meu Perfil</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input type="text" name="nome" value={profile.nome} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>E-mail:</label>
                    <input type="email" name="email" value={profile.email} disabled />
                    <small>O e-mail não pode ser alterado.</small>
                </div>
                <div>
                    <label>Telefone (opcional):</label>
                    <input type="tel" name="telefone" value={profile.telefone || ''} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" />
                </div>
                <div>
                    <label>Horários Disponíveis (opcional):</label>
                    <input type="text" name="horarios_disponiveis" value={profile.horarios_disponiveis || ''} onChange={handleInputChange} placeholder="Ex: Noites durante a semana, Sábados de manhã" />
                </div>
                <div>
                    <label>Outras Informações de Contato (opcional):</label>
                    <textarea name="info_contato" value={profile.info_contato || ''} onChange={handleInputChange} placeholder="Ex: Pode me chamar no WhatsApp, prefiro que liguem após as 18h." />
                </div>
                <button type="submit" disabled={carregando}>
                    {carregando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    );
};

export { EditProfilePage };