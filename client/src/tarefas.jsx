import { useState, useEffect } from 'react';
import './tarefas.css';

export default function Tarefas() {
    const [novaTarefa, setNovaTarefa] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [tarefas, setTarefas] = useState([]); 
    const [carregandoTarefas, setCarregandoTarefas] = useState(true); 

    // Buscar tarefas existentes
    const buscarTarefas = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tarefas?usuario_id=1');
            const data = await response.json();
            
            if (response.ok) {
                setTarefas(data.tarefas || []);
            } else {
                console.error('Erro ao buscar tarefas:', data.error);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        } finally {
            setCarregandoTarefas(false);
        }
    };

    // Buscar tarefas quando o componente carregar
    useEffect(() => {
        buscarTarefas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!novaTarefa.trim()) {
            setMensagem('Por favor, digite uma tarefa!');
            return;
        }

        setCarregando(true);
        setMensagem('');

        try {
            const response = await fetch('http://localhost:5000/api/tarefas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descricao: novaTarefa,
                    usuario_id: 1  
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem('✅ Tarefa adicionada com sucesso!');
                setNovaTarefa(''); // Limpa o input
                buscarTarefas(); // ← ATUALIZA a lista após adicionar
            } else {
                setMensagem(`❌ Erro: ${data.error}`);
            }
        } catch (error) {
            setMensagem('❌ Erro de conexão com o servidor');
            console.error('Erro:', error);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            {/* Header/Banner */}
            <div className="tarefas-container">
                <h1 className="tarefas-title">Bem-vindo às Minhas Tarefas!</h1>
                <p className="tarefas-message">Organize seu dia de forma simples e eficiente!</p>
            </div>
            
            {/* Área de Criação de Tarefas */}
            <div className="criar-tarefa-container">
                <h2>Nova Tarefa</h2>
                
                <form onSubmit={handleSubmit} className="form-tarefa">
                    <input 
                        type="text" 
                        placeholder="Digite sua tarefa..."
                        className="input-tarefa"
                        value={novaTarefa}
                        onChange={(e) => setNovaTarefa(e.target.value)}
                        disabled={carregando}
                    />
                    
                    <button 
                        type="submit" 
                        className="btn-adicionar"
                        disabled={carregando}
                    >
                        {carregando ? '⏳ Adicionando...' : '➕ Adicionar Tarefa'}
                    </button>
                </form>

                {mensagem && (
                    <div className={`mensagem ${mensagem.includes('❌') ? 'erro' : 'sucesso'}`}>
                        {mensagem}
                    </div>
                )}
            </div>
            
             {/* Lista de Tarefas */}
            <div className="lista-tarefas-container">
                <h3>Suas Tarefas</h3>
                <div className="tarefas-list">
                    {carregandoTarefas ? (
                        <p className="lista-carregando">Carregando tarefas...</p>
                    ) : tarefas.length === 0 ? (
                        <div className="input-tarefa lista-vazia">
                            As tarefas aparecerão aqui após serem criadas...
                        </div>
                    ) : (
                        <ul className="lista-tarefas">
                            {tarefas.map((tarefa) => (
                                <li key={tarefa.id} className="tarefa-item input-tarefa">
                                    {tarefa.descricao}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}