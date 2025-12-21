import { useState, useEffect, useCallback } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX } from "react-icons/fi"; 
import moment from "moment"; 

// 🔑 IMPORTAÇÃO DO SERVIÇO: DespesaService
import { DespesaService } from '../../services/api'; 

// Estado inicial do formulário para reuso
const initialFormState = {
    _id: null, 
    tipo: "",
    categoria: "", 
    valor: "",
    // ✅ CORREÇÃO 1 (DATA INICIAL): Garante que o input date inicie no fuso local
    data: moment().format("YYYY-MM-DD"),
    descricao: ""
};

export default function DespesaForm() { 
    // --- 1. Estado da Aplicação ---
    const [despesas, setDespesas] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
    const [despesaToDelete, setDespesaToDelete] = useState(null); 
    const [form, setForm] = useState(initialFormState); 
    
    const isEditing = form._id !== null;

    // 🔑 Função Auxiliar
    const getUserId = () => {
        return localStorage.getItem('userId');
    };

    // --- 2. Carregar Dados do Backend (GET) ---
    const fetchDespesas = useCallback(async () => { 
        const userId = getUserId();
        if (!userId) {
            setError("Usuário não autenticado. Redirecione para login.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 🔑 MUDANÇA: Serviço de Despesas
            const response = await DespesaService.getDespesasByUserId(userId); 
            setDespesas(response.data.sort((a, b) => new Date(b.data) - new Date(a.data)));
        } catch (err) {
            console.error("Erro ao buscar despesas:", err.response ? err.response.data : err.message);
            setError("Falha ao carregar as despesas. Verifique sua conexão ou login.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDespesas();
    }, [fetchDespesas]);

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
    
    function handleEditDespesa(despesa) { 
        // Carrega os dados da despesa no formulário para edição
        setForm({ 
            // Usa o _id se o campo da API for _id, caso contrário usa id.
            _id: despesa._id || despesa.id, 
            ...despesa, 
            // Garante que o valor seja uma string para o input type="number"
            valor: String(despesa.valor || 0), 
            // ✅ CORREÇÃO 2 (DATA EDIÇÃO): Usa .local() para evitar o shift de fuso horário ao carregar o valor
            data: moment(despesa.data).local().format("YYYY-MM-DD") 
        });
        setShowAddModal(true); // Abre o modal
    }
    
    // --- 5. Lógica de Adição/Edição (POST e PUT) ---
    async function handleSubmit(e) {
        e.preventDefault();
        const userId = getUserId();

        // 🔑 MUDANÇA: Validação para 'categoria'
        if (!userId) { alert("Erro: ID de usuário ausente."); return; }
        if (!form.tipo || !form.categoria || !form.valor || !form.data) { alert("Preencha todos os campos obrigatórios."); return; }

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
                // Rota PUT para Edição (DespesaService)
                // ✅ CORREÇÃO 3 (ID): Usa o _id desestruturado
                response = await DespesaService.updateDespesa(_id, dataToSend); 
            } else {
                // Rota POST para Criação (DespesaService)
                response = await DespesaService.createDespesa(dataToSend); 
            }

            alert(response.data.msg); 
            
            setForm(initialFormState); 
            setShowAddModal(false); 
            fetchDespesas(); 

        } catch (err) {
            console.error("Erro na operação:", err.response ? err.response.data : err.message);
            alert(`Falha ao registrar/atualizar despesa: ${err.response?.data?.msg || err.message}`);
        }
    }

    // --- 6. Lógica de Exclusão (Modal de Confirmação) ---
    
    function handleOpenDeleteModal(despesa) { 
        setDespesaToDelete(despesa); 
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        if (!despesaToDelete) return;

        try {
            // ✅ CORREÇÃO 4 (ID DELETE): Usa o _id para garantir a exclusão correta
            await DespesaService.deleteDespesa(despesaToDelete._id); 
            alert("Despesa excluída com sucesso!"); 
            
            setShowDeleteConfirm(false);
            setDespesaToDelete(null);
            fetchDespesas(); 

        } catch (err) {
            console.error("Erro ao excluir despesa:", err.response ? err.response.data : err.message);
            alert(`Falha ao excluir despesa: ${err.response?.data?.msg || "Erro de conexão"}`);
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
        <div className="despesa-manager"> 
            
            {/* 1. Toggle Bar com Botão do Modal */}
            <div className="form-toggle-bar">
                <h3 className="form-toggle-title">Registro de Despesas</h3> 
                <button 
                    className="toggle-form-btn" 
                    onClick={handleOpenAddModal} 
                >
                    <FiPlus size={20} />
                    Nova Despesa 
                </button>
            </div>

            {/* 2. Modal de Cadastro/Edição */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}</h2> 
                            
                        </div>
                        
                        <form className="form cadastro-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input name="tipo" placeholder="Tipo (Ex: Aluguel)" value={form.tipo} onChange={handleChange} required />
                                <input name="categoria" placeholder="Categoria (Ex: Moradia)" value={form.categoria} onChange={handleChange} required /> 
                                <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={handleChange} required />
                                <input name="data" type="date" value={form.data} onChange={handleChange} required />
                            </div>
                            <textarea 
                                name="descricao" 
                                placeholder="Descrição detalhada da despesa (opcional)" 
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
                            <button type="submit" className="btn-primary btn-delete"> 
                                {isEditing ? 'Salvar Alterações' : 'Salvar Despesa'}
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* 3. Modal de Confirmação de Exclusão */}
            {showDeleteConfirm && despesaToDelete && ( 
                <div className="modal-overlay modal-confirm">
                    <div className="modal-content modal-content-small">
                        <div className="modal-header">
                            <h2>Confirmação de Exclusão</h2>
                        </div>
                        <p className="confirm-text">
                            Tem certeza que deseja excluir a despesa {despesaToDelete.tipo} (R$ {parseFloat(despesaToDelete.valor || 0).toFixed(2).replace('.', ',')})?
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


            {/* 4. Lista de Despesas Existentes */}
            <h3 className="list-title">📋 Despesas Registradas ({despesas.length})</h3> 

            <div className="receitas-lista"> {/* 💡 CORREÇÃO APLICADA AQUI: Mudança de 'despesas-lista' para 'receitas-lista' */}
                {loading && <p className="loading-message">Carregando despesas...</p>}
                {error && <p className="error-message">Erro: {error}</p>}
                
                {!loading && !error && despesas.length === 0 ? (
                    <p className="lista-vazia">Nenhuma despesa cadastrada. </p>
                ) : (
                    <div className="tabela-container tabela-responsiva"> 
                        <table>
                            <thead>
                                <tr>
                                    <th className="data-col">Data</th>
                                    <th>Tipo / Categoria</th> 
                                    <th>Descrição</th>
                                    <th className="valor-col">Valor</th>
                                    <th className="acoes-col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {despesas.map((despesa) => ( 
                                    <tr key={despesa._id} className="despesa-item"> 
                                        {/* ✅ CORREÇÃO 5 (DATA EXIBIÇÃO): Usa .local() para exibir a data correta */}
                                        <td>{moment(despesa.data).local().format("DD/MM/YYYY")}</td>
                                        <td>
                                            <strong>{despesa.tipo}</strong>
                                            <span className="fonte-subtext"> ({despesa.categoria || 'Sem Categoria'})</span> {/* Alteração para 'categoria' e mantendo 'fonte-subtext' do CSS para herdar o estilo */}
                                        </td>
                                        <td>{despesa.descricao || 'N/A'}</td>
                                        {/* 🔑 MUDANÇA: valor-positivo -> valor-negativo para despesas */}
                                        <td className="valor-col valor-negativo"> 
                                            {formatValue(despesa.valor)}
                                        </td>
                                        {/* ✅ CORREÇÃO 7 (BOTÕES DE AÇÃO): Botões dentro do <td> */}
                                        <td className="acoes-col"> 
                                            <button 
                                                onClick={() => handleEditDespesa(despesa)} 
                                                className="action-btn edit-btn"
                                                aria-label="Editar"
                                            >
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteModal(despesa)} 
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