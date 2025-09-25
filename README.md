# Vizinho Amigo 🤝

Bem-vindo ao Vizinho Amigo, um aplicativo web full-stack projetado para fortalecer comunidades em condomínios, facilitando a troca de favores, o compartilhamento de itens e a comunicação direta entre vizinhos.

Este projeto foi desenvolvido como um sistema completo, desde a arquitetura do banco de dados até o deploy em produção, utilizando tecnologias modernas para criar uma experiência interativa e em tempo real.

## ✨ Funcionalidades Principais

* **Sistema de Grupos Privados:** Crie e participe de grupos (condomínios) através de um sistema seguro de PINs de convite.
* **Mural de Atividades:**
    * **Solicitações:** Publique um pedido de ajuda ou de um item emprestado.
    * **Ofertas:** Ofereça um item para empréstimo, doação ou um serviço para a comunidade.
* **Chat em Tempo Real:** Converse diretamente com um vizinho sobre uma solicitação específica para combinar os detalhes da ajuda.
* **Notificações Instantâneas:** Receba alertas visuais sobre novas mensagens no chat, não importa em qual página do aplicativo você esteja.
* **Sistema de Conclusão e Avaliação:** Marque tarefas como concluídas, escolha quem te ajudou e deixe uma avaliação com nota e comentário, construindo um sistema de reputação.
* **Gerenciamento de Atividades:**
    * Páginas de "Minhas Atividades" e "Histórico" para fácil gerenciamento.
    * O dono de uma postagem pode editar ou excluir suas publicações.
    * O dono de uma oferta pode atualizar seu status (Disponível, Em Uso, Encerrada).
* **Perfis de Usuário:** Edite seu perfil para adicionar informações de contato (telefone, horários), facilitando a comunicação com os vizinhos.

## 🛠️ Tecnologias Utilizadas

O projeto é uma aplicação full-stack monorepo, contendo o backend e o frontend na mesma estrutura de pastas.

### Backend (Python / Flask)

* **Framework:** Flask
* **Banco de Dados:** SQLAlchemy (ORM) com Flask-Migrate (Alembic) para gerenciamento de migrações.
* **Comunicação em Tempo Real:** Flask-SocketIO com Eventlet.
* **Autenticação:** Baseada em tokens com Flask-JWT-Extended.
* **Servidor de Produção:** Gunicorn.
* **Dependências Principais:** `Flask`, `Flask-SQLAlchemy`, `Flask-Migrate`, `Flask-SocketIO`, `Flask-JWT-Extended`, `Flask-CORS`, `psycopg2-binary`, `pymysql`.

### Frontend (React / TypeScript)

* **Framework:** React com Vite.
* **Linguagem:** TypeScript.
* **Roteamento:** React Router.
* **Requisições HTTP:** Axios.
* **Comunicação em Tempo Real:** Socket.IO Client.
* **Estilização:** CSS puro com foco em layout moderno (Flexbox/Grid).

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e rodar o Vizinho Amigo na sua máquina.

### Pré-requisitos
* Node.js (v18+) e npm
* Python (v3.11+) e pip
* Um servidor de banco de dados MySQL rodando localmente.

### Configuração do Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure o Banco de Dados:**
    * Crie um novo banco de dados no seu MySQL (ex: `condominio_amigo_db`).
    * Verifique se as credenciais no arquivo `backend/config.py` correspondem à sua configuração local ou use variáveis de ambiente.
5.  **Aplique as Migrações:**
    * A partir da pasta **raiz do projeto**, defina a variável `FLASK_APP`:
        ```bash
        # Windows (PowerShell)
        $env:FLASK_APP = "backend.app"

        # macOS / Linux
        export FLASK_APP="backend.app"
        ```
    * Execute o comando de upgrade para criar todas as tabelas:
        ```bash
        flask db upgrade
        ```
6.  **Execute o Servidor:**
    * A partir da pasta **raiz do projeto**, execute:
        ```bash
        python run.py
        ```
    * O servidor backend estará rodando em `http://localhost:5000`.

### Configuração do Frontend

1.  **Abra um novo terminal.**
2.  **Navegue até a pasta do frontend:**
    ```bash
    cd meu-frontend
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Execute o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
5.  Acesse `http://localhost:5173` (ou a porta indicada) no seu navegador.

---
Este projeto foi desenvolvido por Lucas Viana.