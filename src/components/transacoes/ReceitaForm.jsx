import { useState, useEffect, useCallback } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX } from "react-icons/fi"; 
import moment from "moment"; 

// 🔑 IMPORTAÇÃO DO SERVIÇO: Verifique se o caminho relativo está correto
import { ReceitaService } from '../../services/api'; 

// Estado inicial do formulário para reuso
const initialFormState = {
    _id: null, 
    tipo: "",
    fonte: "",
    valor: "",
    // ✅ CORREÇÃO 1 (DATA INICIAL): Garante que o input date inicie no fuso local
    data: moment().format("YYYY-MM-DD"),
    descricao: ""
};

export default function ReceitaForm() { 
    // --- 1. Estado da Aplicação ---
    const [receitas, setReceitas] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
    const [receitaToDelete, setReceitaToDelete] = useState(null); 
    const [form, setForm] = useState(initialFormState); 
    
    const isEditing = form._id !== null;

    // 🔑 Função Auxiliar
    const getUserId = () => {
        return localStorage.getItem('userId');
    };

    // --- 2. Carregar Dados do Backend (GET) ---
    const fetchReceitas = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setError("Usuário não autenticado. Redirecione para login.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await ReceitaService.getReceitasByUserId(userId); 
            setReceitas(response.data.sort((a, b) => new Date(b.data) - new Date(a.data)));
        } catch (err) {
            console.error("Erro ao buscar receitas:", err.response ? err.response.data : err.message);
            setError("Falha ao carregar as receitas. Verifique sua conexão ou login.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReceitas();
    }, [fetchReceitas]);

    // --- 3. Funções de Manipulação do Formulário ---
    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    // --- 4. Abrir Modal de Adição/Edição ---
    function handleOpenAddModal() {
        setForm(initialFormState); // Reseta para Adição
        setShowAddModal(true);
    }
    
    function handleEditReceita(receita) {
        // Carrega os dados da receita no formulário para edição
        setForm({ 
            // Usa o _id se o campo da API for _id, caso contrário usa id.
            _id: receita._id || receita.id, 
            ...receita, 
            // Garante que o valor seja uma string para o input type="number"
            valor: String(receita.valor || 0), 
            // ✅ CORREÇÃO 2 (DATA EDIÇÃO): Usa .local() para evitar o shift de fuso horário ao carregar o valor
            data: moment(receita.data).local().format("YYYY-MM-DD") 
        });
        setShowAddModal(true); // Abre o modal
    }
    
    // --- 5. Lógica de Adição/Edição (POST e PUT) ---
    async function handleSubmit(e) {
        e.preventDefault();
        const userId = getUserId();

        if (!userId) { alert("Erro: ID de usuário ausente."); return; }
        if (!form.tipo || !form.fonte || !form.valor || !form.data) { alert("Preencha todos os campos obrigatórios."); return; }

        try {
            // Desestrutura o _id para não enviá-lo no corpo da requisição POST
            const { _id, ...rest } = form;
            
            const dataToSend = {
                ...rest,
                // Garantia de envio como string de um float válido
                valor: String(parseFloat(rest.valor) || 0), 
                userId: userId
            };

            let response;
            
            if (isEditing) {
                // Rota PUT para Edição
                // ✅ CORREÇÃO 3 (ID): Usa o _id desestruturado
                response = await ReceitaService.updateReceita(_id, dataToSend); 
            } else {
                // Rota POST para Criação
                response = await ReceitaService.createReceita(dataToSend); 
            }

            alert(response.data.msg); 
            
            setForm(initialFormState); 
            setShowAddModal(false); 
            fetchReceitas(); 

        } catch (err) {
            console.error("Erro na operação:", err.response ? err.response.data : err.message);
            alert(`Falha ao registrar/atualizar receita: ${err.response?.data?.msg || err.message}`);
        }
    }

    // --- 6. Lógica de Exclusão (Modal de Confirmação) ---
    
    function handleOpenDeleteModal(receita) {
        setReceitaToDelete(receita);
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        if (!receitaToDelete) return;

        try {
            // ✅ CORREÇÃO 4 (ID DELETE): Usa o _id para garantir a exclusão correta
            await ReceitaService.deleteReceita(receitaToDelete._id); 
            alert("Receita excluída com sucesso!");
            
            setShowDeleteConfirm(false);
            setReceitaToDelete(null);
            fetchReceitas(); 

        } catch (err) {
            console.error("Erro ao excluir receita:", err.response ? err.response.data : err.message);
            alert(`Falha ao excluir receita: ${err.response?.data?.msg || "Erro de conexão"}`);
        }
    }

    // --- 7. Função de Formatação de Valor (Para a Tabela) ---
    const formatValue = (value) => {
        // CORREÇÃO: Lida com valores nulos, vazios ou inválidos (resolvendo R$ NaN)
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return 'R$ 0,00'; 

        // Retorna o valor formatado para BRL (R$)
        return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // --- 8. Renderização ---
    return (
        <div className="receita-manager">
            
            {/* 1. Toggle Bar com Botão do Modal */}
            <div className="form-toggle-bar">
                <h3 className="form-toggle-title">Registro de Receitas</h3>
                <button 
                    className="toggle-form-btn" 
                    onClick={handleOpenAddModal} 
                >
                    <FiPlus size={20} />
                    Nova Receita
                </button>
            </div>

            {/* 2. Modal de Cadastro/Edição (MANTIDO) */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Receita' : 'Cadastrar Nova Receita'}</h2>
                            
                        </div>
                        
                        <form className="form cadastro-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input name="tipo" placeholder="Tipo (Ex: Salário)" value={form.tipo} onChange={handleChange} required />
                                <input name="fonte" placeholder="Fonte (Ex: Empresa X)" value={form.fonte} onChange={handleChange} required />
                                <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={handleChange} required />
                                <input name="data" type="date" value={form.data} onChange={handleChange} required />
                            </div>
                            <textarea 
                                name="descricao" 
                                placeholder="Descrição detalhada da receita (opcional)" 
                                value={form.descricao} 
                                onChange={handleChange}>
                            </textarea>
                             <div className="confirm-actions">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Salvar Alterações' : 'Salvar Receita'}
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* 3. Modal de Confirmação de Exclusão (MANTIDO) */}
            {showDeleteConfirm && receitaToDelete && (
                <div className="modal-overlay modal-confirm">
                    <div className="modal-content modal-content-small">
                        <div className="modal-header">
                            <h2>Confirmação de Exclusão</h2>
                        </div>
                        <p className="confirm-text">
                            Tem certeza que deseja excluir a receita {receitaToDelete.tipo} (R$ {parseFloat(receitaToDelete.valor || 0).toFixed(2).replace('.', ',')})?
                        </p>
                        <div className="confirm-actions">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Não
                            </button>
                            <button 
                                className="btn-delete" 
                                onClick={confirmDelete}
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* 4. Lista de Receitas Existentes */}
            <h3 className="list-title">📋 Receitas Registradas ({receitas.length})</h3>

            <div className="receitas-lista">
                {loading && <p className="loading-message">Carregando receitas...</p>}
                {error && <p className="error-message">Erro: {error}</p>}
                
                {!loading && !error && receitas.length === 0 ? (
                    <p className="lista-vazia">Nenhuma receita cadastrada. </p>
                ) : (
                    <div className="tabela-container tabela-responsiva"> 
                        <table>
                            <thead>
                                <tr>
                                    <th className="data-col">Data</th>
                                    <th>Tipo / Fonte</th>
                                    <th>Descrição</th>
                                    <th className="valor-col">Valor</th>
                                    <th className="acoes-col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receitas.map((receita) => (
                                    <tr key={receita._id} className="receita-item">
                                        {/* ✅ CORREÇÃO 5 (DATA EXIBIÇÃO): Usa .local() para exibir a data correta */}
                                        <td>{moment(receita.data).local().format("DD/MM/YYYY")}</td>
                                        <td>
                                            <strong>{receita.tipo}</strong>
                                            <span className="fonte-subtext"> ({receita.fonte || 'Sem Fonte'})</span> 
                                        </td>
                                        <td>{receita.descricao || 'N/A'}</td>
                                        <td className="valor-col valor-positivo">
                                            {/* ✅ CORREÇÃO 6 (VALOR COMPLETO): Usa a função formatValue para garantir a formatação e evitar NaN */}
                                            {formatValue(receita.valor)}
                                        </td>
                                        {/* ✅ CORREÇÃO 7 (BOTÕES DE AÇÃO): Botões dentro do <td> */}
                                        <td className="acoes-col"> 
                                            <button 
                                                onClick={() => handleEditReceita(receita)} 
                                                className="action-btn edit-btn"
                                                aria-label="Editar"
                                            >
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteModal(receita)} 
                                                className="action-btn delete-btn"
                                                aria-label="Deletar"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                    </div>
                )}
            </div>
        </div>
    );
}