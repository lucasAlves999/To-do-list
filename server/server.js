const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

// Configuração do banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Criar tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('Tabela de usuários verificada/criada com sucesso');
    }
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota de cadastro de usuário
app.post('/api/usuarios/cadastrar', (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const checkEmailSql = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(checkEmailSql, [email], (err, row) => {
      if (err) {
        console.error('Erro ao verificar email:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (row) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }

      // Inserir novo usuário
      const insertSql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
      db.run(insertSql, [nome, email, senha], function(err) {
        if (err) {
          console.error('Erro ao inserir usuário:', err);
          return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        }

        res.status(201).json({
          message: 'Usuário cadastrado com sucesso!',
          usuario: {
            id: this.lastID,
            nome: nome,
            email: email
          }
        });
      });
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar usuários (opcional - para teste)
app.get('/api/usuarios', (req, res) => {
  const sql = `SELECT id, nome, email, data_criacao FROM usuarios`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Fechar conexão com o banco ao encerrar o servidor
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com o banco fechada.');
    process.exit(0);
  });
});