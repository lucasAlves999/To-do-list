// src/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco de dados
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    
    // Criar tabela de usuários se não existir
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
        console.log('Tabela de usuários criada/verificada com sucesso.');
      }
    });
  }
});

// Função para inserir um novo usuário
export const inserirUsuario = (nome, email, senha, callback) => {
  const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
  
  db.run(sql, [nome, email, senha], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id: this.lastID, nome, email });
    }
  });
};

// Função para buscar usuário por email
export const buscarUsuarioPorEmail = (email, callback) => {
  const sql = `SELECT * FROM usuarios WHERE email = ?`;
  
  db.get(sql, [email], (err, row) => {
    callback(err, row);
  });
};

export default db;