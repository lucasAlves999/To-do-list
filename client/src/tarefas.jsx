import { useState, useEffect } from 'react';
import './tarefas.css';

export default function Tarefas() {
    const [novaTarefa, setNovaTarefa] = useState({
        descricao: '',
        due_date: ''
    });
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [tarefas, setTarefas] = useState([]); 
    const [carregandoTarefas, setCarregandoTarefas] = useState(true);
    const [notificacao, setNotificacao] = useState({ mensagem: "", tipo: "" }); // ✅ NOVA NOTIFICAÇÃO
    
    // ✅ PEGAR O ID DO USUÁRIO LOGADO
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioNome = localStorage.getItem('usuario_nome') || 'Usuário';

    // Buscar tarefas existentes DO USUÁRIO LOGADO
    const buscarTarefas = async () => {
        if (!usuarioId) {
            setMensagem('❌ Usuário não identificado. Faça login novamente.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/tarefas?usuario_id=${usuarioId}`);
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

    // ✅ 1. FUNÇÃO PARA EXCLUIR TAREFA
    const excluirTarefa = async (tarefaId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/tarefas/${tarefaId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                buscarTarefas();
                mostrarNotificacao("Tarefa excluída com sucesso!", "sucesso");
            } else {
                mostrarNotificacao("Erro ao excluir tarefa", "erro");
            }
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            mostrarNotificacao("Erro ao excluir tarefa", "erro");
        }
    };

    // ✅ 2. FUNÇÃO PARA CONCLUIR TAREFA
    const concluirTarefa = async (tarefaId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tarefas/${tarefaId}/concluir`, {
                method: 'PATCH',
            });

            if (response.ok) {
                buscarTarefas();
                // ✅ NOTIFICAÇÃO DE CONCLUSÃO
                mostrarNotificacao("🎉 Parabéns! Tarefa concluída!", "sucesso");
            } else {
                mostrarNotificacao("Erro ao concluir tarefa", "erro");
            }
        } catch (error) {
            console.error("Erro ao concluir tarefa:", error);
            mostrarNotificacao("Erro ao concluir tarefa", "erro");
        }
    };

    // ✅ 3. FUNÇÃO PARA REABRIR TAREFA
    const reabrirTarefa = async (tarefaId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tarefas/${tarefaId}/reabrir`, {
                method: 'PATCH',
            });

            if (response.ok) {
                buscarTarefas();
                // ✅ NOTIFICAÇÃO DE PENDÊNCIA
                mostrarNotificacao("⚠️ Tarefa marcada como pendente!", "aviso");
            } else {
                mostrarNotificacao("Erro ao reabrir tarefa", "erro");
            }
        } catch (error) {
            console.error("Erro ao reabrir tarefa:", error);
            mostrarNotificacao("Erro ao reabrir tarefa", "erro");
        }
    };

    // ✅ FUNÇÃO PARA MOSTRAR NOTIFICAÇÕES
    const mostrarNotificacao = (mensagem, tipo) => {
        setNotificacao({ mensagem, tipo });
        setTimeout(() => {
            setNotificacao({ mensagem: "", tipo: "" });
        }, 4000);
    };

    // Buscar tarefas quando o componente carregar
    useEffect(() => {
        buscarTarefas();
    }, [usuarioId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!usuarioId) {
            setMensagem('❌ Usuário não identificado. Faça login novamente.');
            return;
        }

        if (!novaTarefa.descricao.trim()) {
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
                    descricao: novaTarefa.descricao,
                    due_date: novaTarefa.due_date || null,
                    usuario_id: parseInt(usuarioId)
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarNotificacao('✅ Tarefa adicionada com sucesso!', 'sucesso');
                setNovaTarefa({ descricao: '', due_date: '' });
                buscarTarefas();
            } else {
                mostrarNotificacao(`❌ Erro: ${data.error}`, 'erro');
            }
        } catch (error) {
            mostrarNotificacao('❌ Erro de conexão com o servidor', 'erro');
            console.error('Erro:', error);
        } finally {
            setCarregando(false);
        }
    };

    // Formatar data para exibição
    const formatarData = (dataString) => {
        if (!dataString) return 'Sem data definida';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Verificar se a tarefa está atrasada
    const estaAtrasada = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    // Estatísticas
    const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
    const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
    const tarefasAtrasadas = tarefas.filter(t => !t.concluida && estaAtrasada(t.due_date)).length;

    return (
        <>
            {/* Header/Banner */}
            <div className="tarefas-container">
                <h1 className="tarefas-title">📅 Gerenciamento de Tarefas</h1>
                <p className="tarefas-message">Olá, {usuarioNome}! Aqui estão suas tarefas.</p>
            </div>

            {/* ✅ NOTIFICAÇÃO NOVA */}
            {notificacao.mensagem && (
                <div className={`notificacao ${notificacao.tipo}`}>
                    {notificacao.mensagem}
                </div>
            )}
            
            {/* Área de Criação de Tarefas */}
            <div className="criar-tarefa-container">
                <h2>Nova Tarefa</h2>
                
                <form onSubmit={handleSubmit} className="form-tarefa">
                    <input 
                        type="text" 
                        placeholder="Digite sua tarefa..."
                        className="input-tarefa"
                        value={novaTarefa.descricao}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                        disabled={carregando}
                    />
                    
                    <input
                        type="datetime-local"
                        className="input-tarefa"
                        value={novaTarefa.due_date}
                        onChange={(e) => setNovaTarefa({ ...novaTarefa, due_date: e.target.value })}
                        disabled={carregando}
                    />
                    
                    <button 
                        type="submit" 
                        className="btn-adicionar"
                        disabled={carregando || !usuarioId}
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

            {/* Estatísticas */}
            <div className="lista-tarefas-container">
                <h3>📊 Estatísticas de {usuarioNome}</h3>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '15px',
                    textAlign: 'center'
                }}>
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6A5ACD' }}>{tarefas.length}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Total</div>
                    </div>
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{tarefasConcluidas}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Concluídas</div>
                    </div>
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{tarefasPendentes}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Pendentes</div>
                    </div>
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{tarefasAtrasadas}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Atrasadas</div>
                    </div>
                </div>
            </div>
            
            {/* Lista de Tarefas*/}
            <div className="lista-tarefas-container">
                <h3>📋 Suas Tarefas</h3>
                <div className="tarefas-list">
                    {carregandoTarefas ? (
                        <p className="lista-carregando">Carregando tarefas...</p>
                    ) : !usuarioId ? (
                        <div className="input-tarefa lista-vazia" style={{ color: '#dc3545' }}>
                            ❌ Erro: Usuário não identificado. Faça login novamente.
                        </div>
                    ) : tarefas.length === 0 ? (
                        <div className="input-tarefa lista-vazia">
                            Nenhuma tarefa cadastrada. Adicione sua primeira tarefa acima!
                        </div>
                    ) : (
                        <ul className="lista-tarefas">
                            {tarefas.map((tarefa) => (
                                <li 
                                    key={tarefa.id} 
                                    className="tarefa-item input-tarefa"
                                    style={{
                                        borderLeft: estaAtrasada(tarefa.due_date) && !tarefa.concluida ? '4px solid #dc3545' : '4px solid #28a745',
                                        backgroundColor: tarefa.concluida ? '#f8fff8' : '#fff'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                        {/* Indicador visual de status */}
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: tarefa.concluida ? '#28a745' : 
                                                               estaAtrasada(tarefa.due_date) ? '#dc3545' : '#ffc107',
                                                flexShrink: 0,
                                                marginTop: '2px'
                                            }}
                                            title={tarefa.concluida ? 'Concluída' : 
                                                  estaAtrasada(tarefa.due_date) ? 'Atrasada' : 'Pendente'}
                                        />
                                        
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                textDecoration: tarefa.concluida ? 'line-through' : 'none',
                                                color: tarefa.concluida ? '#666' : '#333',
                                                fontWeight: '500',
                                                marginBottom: '8px',
                                                fontSize: '16px'
                                            }}>
                                                {tarefa.descricao}
                                            </div>
                                            
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                <div>📅 <strong>Vencimento:</strong> {formatarData(tarefa.due_date)}</div>
                                                <div>🕐 <strong>Criada em:</strong> {formatarData(tarefa.data_criacao)}</div>
                                                <div>📊 <strong>Status:</strong> 
                                                    <span style={{ 
                                                        color: tarefa.concluida ? '#28a745' : 
                                                              estaAtrasada(tarefa.due_date) ? '#dc3545' : '#ffc107',
                                                        fontWeight: 'bold',
                                                        marginLeft: '5px'
                                                    }}>
                                                        {tarefa.concluida ? 'Concluída' : 
                                                         estaAtrasada(tarefa.due_date) ? 'Atrasada' : 'Pendente'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* ✅ BOTÕES DE AÇÃO */}
                                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                {tarefa.concluida ? (
                                                    <button 
                                                        onClick={() => reabrirTarefa(tarefa.id)}
                                                        className="btn-reabrir"
                                                        style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#f39c12',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        🔄 Reabrir
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => concluirTarefa(tarefa.id)}
                                                        className="btn-concluir"
                                                        style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#27ae60',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        ✅ Concluir
                                                    </button>
                                                )}
                                                
                                                {/* ✅ BOTÃO EXCLUIR */}
                                                <button 
                                                    onClick={() => excluirTarefa(tarefa.id)}
                                                    className="btn-excluir"
                                                    style={{
                                                        padding: '8px 12px',
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}