📋 TUTORIAL COMPLETO - COMO RODAR O PROJETO

🚀 PRÉ-REQUISITOS
Docker Desktop instalado 
Git instalado
Conta no GitHub

📥 PASSO 1: BAIXAR O PROJETO
Opção A: Clone via Git
git clone https://github.com/seu-usuario/lista-tarefas.git
cd lista-tarefas

🐳 PASSO 2: VERIFICAR DOCKER
Abra o Docker Desktop

Espere até aparecer "Docker Desktop is running"

Abra o terminal no VS Code (Ctrl + `)

Teste se o Docker funciona:


docker --version
docker-compose --version

🚀 PASSO 3: RODAR O PROJETO (MÉTODO FÁCIL)
Comando Único - Tudo no Docker:

# Na pasta raiz do projeto (onde está docker-compose.yml)
docker-compose up --build
Isso vai:

✅ Baixar e configurar o MySQL

✅ Construir e rodar a API Flask

✅ Construir e rodar o Frontend React

✅ Conectar todos os serviços automaticamente

⏳ O QUE ESPERAR:
Primeira vez: Pode demorar 5-10 minutos (baixa imagens)

Você verá logs de todos os serviços no terminal

Não feche o terminal enquanto estiver usando

🌐 PASSO 4: ACESSAR A APLICAÇÃO
Quando estiver rodando, abra no navegador:

🎨 Frontend (Interface): http://localhost:5173
🔧 Backend (API): http://localhost:5000

👤 PASSO 5: PRIMEIRO USO
Cadastre um usuário na página inicial

Faça login com email e senha

Comece a criar tarefas! ✅

⚡ MÉTODO ALTERNATIVO (PARA DESENVOLVIMENTO)
Se quiser desenvolvimento mais rápido com hot reload:

Terminal 1 - Banco de Dados:

docker-compose up mysql -d
Terminal 2 - Backend (Flask):

cd server_py
python app.py

Terminal 3 - Frontend (React):

cd client
npm run dev

🛑 COMANDOS ÚTEIS
Parar a aplicação:

# No terminal onde está rodando: Ctrl + C
# Depois:
docker-compose down

Reiniciar:
docker-compose down
docker-compose up --build

Ver containers rodando:

docker ps

Ver logs:

docker logs todo_flask
docker logs todo_mysql
docker logs todo_react

❌ SOLUÇÃO DE PROBLEMAS COMUNS
Erro: "Port already in use"

docker-compose down
docker-compose up --build

Erro: Docker não inicia
Verifique se Docker Desktop está aberto

Reinicie o Docker Desktop

Erro: "Cannot connect to MySQL"
Espere o MySQL inicializar completamente (2-3 minutos)

Verifique com docker ps se todos containers estão "Up"

Projeto não atualiza
Use o método de desenvolvimento com terminal separados

Ou reconstrua: docker-compose up --build

📁 ESTRUTURA DO PROJETO
text
lista-tarefas/
├── 📁 client/          # Frontend React
├── 📁 server_py/       # Backend Flask  
├── 📁 database/        # Scripts do banco
├── 🐳 docker-compose.yml  # Orquestração
└── 📖 README.md        # Este tutorial
🎯 RESUMO RÁPIDO
Clone o projeto

Abra Docker Desktop

Execute: docker-compose up --build

Acesse: http://localhost:5173

Cadastre-se e use!

🎊 PRONTO! AGORA É SÓ COMEÇAR A USAR!

Qualquer problema, verifique se:

✅ Docker Desktop está rodando

✅ Todos containers estão up (docker ps)

✅ Portas 5173 e 5000 estão livres

Divirta-se organizando suas tarefas! 🚀

