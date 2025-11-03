import { useState } from 'react';
import './App.css'; 
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // ✅ SALVAR O ID DO USUÁRIO NO localStorage
      localStorage.setItem('usuario_id', data.usuario.id);
      localStorage.setItem('usuario_nome', data.usuario.nome);

      alert(`Bem-vindo de volta, ${data.usuario.nome}!`);
      navigate('/tarefas');
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conteiner">
      <h1 className="hh">LOGIN</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        <br />
        <button 
          type="submit" 
          className="botao"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <Link to="/cadastro" className='lk'>
          Cadastro
        </Link>
      </form>
    </div>
  );
}

export default Login;