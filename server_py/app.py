import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuração do MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://todo_user:todo_password@localhost:3307/todo_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



db = SQLAlchemy(app)


class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<Usuario {self.nome}>"


class Tarefa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(255), nullable=False)
    concluida = db.Column(db.Boolean, default=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))

    def __repr__(self):
        return f"<Tarefa {self.descricao}>"

    def to_dict(self):
        return {
            'id': self.id,
            'descricao': self.descricao,
            'concluida': self.concluida,
            'data_criacao': self.data_criacao.isoformat(),
            'usuario_id': self.usuario_id
        }

# Cria tabelas no banco
with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return jsonify({"message": "Backend Flask rodando com MySQL!"})

@app.route("/api/usuarios/cadastrar", methods=["POST"])
def cadastrar_usuario():
    data = request.json
    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")

    if not nome or not email or not senha:
        return jsonify({"error": "Preencha todos os campos"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "Email já cadastrado"}), 400

    novo_usuario = Usuario(nome=nome, email=email, senha=senha)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"message": f"Usuário {nome} cadastrado com sucesso!"}), 201

@app.route("/api/usuarios/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = Usuario.query.filter_by(email=email, senha=senha).first()

    if usuario:
        return jsonify({
            "message": "Login bem-sucedido!",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email
            }
        })
    else:
        return jsonify({"error": "Email ou senha incorretos"}), 401


@app.route("/api/tarefas", methods=["POST"])
def criar_tarefa():
    data = request.json
    descricao = data.get("descricao")
    usuario_id = data.get("usuario_id", 1)  

    if not descricao:
        return jsonify({"error": "Descrição da tarefa é obrigatória"}), 400

    nova_tarefa = Tarefa(descricao=descricao, usuario_id=usuario_id)
    db.session.add(nova_tarefa)
    db.session.commit()

    return jsonify({
        "message": "Tarefa criada com sucesso!",
        "tarefa": nova_tarefa.to_dict()
    }), 201

@app.route("/api/tarefas", methods=["GET"])
def listar_tarefas():
    usuario_id = request.args.get('usuario_id', 1)  
    tarefas = Tarefa.query.filter_by(usuario_id=usuario_id).order_by(Tarefa.data_criacao.desc()).all()
    
    return jsonify({
        "tarefas": [tarefa.to_dict() for tarefa in tarefas]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)