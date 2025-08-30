import { useState } from 'react';
import './App.css';

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/usuarios/cadastrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar');
      }

      alert(`Usuário ${nome} cadastrado com sucesso!`);
      
      // Limpar formulário
      setNome("");
      setEmail("");
      setSenha("");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conteiner">
      <h1 className="hh">Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Nome'
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={loading}
        />
        <br />
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
          placeholder="Crie uma senha"
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
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}

export default App;