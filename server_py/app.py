from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuração do MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Jtd4789%40@localhost:3306/meu_banco'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo dentro do app.py
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<Usuario {self.nome}>"

# Cria tabelas no banco
with app.app_context():
    db.create_all()

# Rotas
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)