from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import time
from sqlalchemy import text

# Criar app Flask primeiro
app = Flask(__name__)
CORS(app)

# Configurar SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://todo_user:todo_password@todo_mysql:3306/todo_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Criar instância do SQLAlchemy
db = SQLAlchemy(app)

# Definir modelos
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
    due_date = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Tarefa {self.descricao}>"

    def to_dict(self):
        status = "concluída" if self.concluida else "pendente"
        return {
        'id': self.id,
        'descricao': self.descricao,
        'concluida': self.concluida,
        'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
        'usuario_id': self.usuario_id,
        'due_date': self.due_date.isoformat() if self.due_date else None,
        'status': status,
        'atrasada': self.due_date and not self.concluida and self.due_date < datetime.utcnow()
    }

# Inicialização do banco (agora app já existe)
with app.app_context():
    print("Iniciando Flask app - aguardando MySQL...")
    retries = 30  # mais tentativas
    for attempt in range(retries):
        try:
            db.session.execute(text("SELECT 1"))
            print("Conexão MySQL OK - criando tabelas...")
            db.create_all()
            print("Tabelas criadas com sucesso!")
            break
        except Exception as e:
            print(f"Tentativa {attempt + 1}/{retries}: {str(e)}")
            time.sleep(3)
    else:
        print("ERRO: Não foi possível conectar ao MySQL após várias tentativas")

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
    data = request.json or {}
    descricao = data.get("descricao")
    usuario_id = data.get("usuario_id", 1)
    due_date_str = data.get("due_date")

    if not descricao:
        return jsonify({"error": "Descrição da tarefa é obrigatória"}), 400

    due_date = None
    if due_date_str:
        try:
            due_date = datetime.fromisoformat(due_date_str)
        except Exception:
            return jsonify({"error": "due_date inválido. Use ISO 8601"}), 400

    nova_tarefa = Tarefa(descricao=descricao, usuario_id=usuario_id, due_date=due_date)
    db.session.add(nova_tarefa)
    db.session.commit()

    return jsonify({
        "message": "Tarefa criada com sucesso!",
        "tarefa": nova_tarefa.to_dict()
    }), 201

@app.route("/api/tarefas", methods=["GET"])
def listar_tarefas():
    usuario_id = request.args.get('usuario_id', 1)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Tarefa.query.filter_by(usuario_id=usuario_id)

    try:
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Tarefa.due_date >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Tarefa.due_date <= end_dt)
    except Exception:
        return jsonify({"error": "Formato de data inválido"}), 400

    tarefas = query.order_by(Tarefa.data_criacao.desc()).all()
    return jsonify({"tarefas": [t.to_dict() for t in tarefas]})

@app.route("/api/tarefas/<int:tarefa_id>/due", methods=["PATCH"])
def atualizar_due_date(tarefa_id):
    data = request.json or {}
    if 'due_date' not in data:
        return jsonify({"error": "Campo due_date obrigatório"}), 400

    tarefa = Tarefa.query.get_or_404(tarefa_id)
    due_date_val = data.get('due_date')

    if due_date_val is None:
        tarefa.due_date = None
    else:
        try:
            tarefa.due_date = datetime.fromisoformat(due_date_val)
        except Exception:
            return jsonify({"error": "Formato de due_date inválido"}), 400

    db.session.commit()
    return jsonify({"message": "Due date atualizado", "tarefa": tarefa.to_dict()})

@app.route("/api/tarefas/<int:tarefa_id>", methods=["DELETE"])
def excluir_tarefa(tarefa_id):
    try:
        tarefa = Tarefa.query.get_or_404(tarefa_id)
        db.session.delete(tarefa)
        db.session.commit()
        return jsonify({"message": "Tarefa excluída com sucesso!"})
    except Exception as e:
        return jsonify({"error": f"Erro ao excluir tarefa: {str(e)}"}), 500

@app.route("/api/tarefas/<int:tarefa_id>/concluir", methods=["PATCH"])
def concluir_tarefa(tarefa_id):
    try:
        tarefa = Tarefa.query.get_or_404(tarefa_id)
        tarefa.concluida = True
        db.session.commit()
        return jsonify({
            "message": "Tarefa concluída com sucesso!",
            "tarefa": tarefa.to_dict()
        })
    except Exception as e:
        return jsonify({"error": f"Erro ao concluir tarefa: {str(e)}"}), 500

@app.route("/api/tarefas/<int:tarefa_id>/reabrir", methods=["PATCH"])
def reabrir_tarefa(tarefa_id):
    try:
        tarefa = Tarefa.query.get_or_404(tarefa_id)
        tarefa.concluida = False
        db.session.commit()
        return jsonify({
            "message": "Tarefa reaberta!",
            "tarefa": tarefa.to_dict()
        })
    except Exception as e:
        return jsonify({"error": f"Erro ao reabrir tarefa: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')