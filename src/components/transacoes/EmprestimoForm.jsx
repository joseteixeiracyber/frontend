import { useState, useCallback, useEffect } from "react"; 
import { FiTrash2, FiEdit3, FiPlus, FiX, FiHome } from "react-icons/fi"; 
import moment from "moment"; 
import { EmprestimoService } from "../../services/api"; 

// --- Funções de Ajuda (Mantidas) ---
const formatValue = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue === null) return 'R$ 0,00'; 
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const calcularValorParcela = (valorTotal, taxaJurosMensal, numeroParcelas) => {
    if (isNaN(valorTotal) || isNaN(taxaJurosMensal) || isNaN(numeroParcelas) || numeroParcelas <= 0) {
        return 0;
    }
    
    const i = taxaJurosMensal / 100;
    const PV = valorTotal;
    const n = numeroParcelas;

    if (i <= 0) { 
        return PV / n;
    }
    
    const potencia = Math.pow((1 + i), n);
    const numerador = PV * i * potencia;
    const denominador = potencia - 1;
    
    if (denominador === 0) return 0;

    return numerador / denominador;
};

// Função auxiliar para fechar e resetar o modal
const closeAndResetModal = (setModal, setEditing, setForm, initialFormState) => {
    setModal(false);
    setEditing(false);
    setForm(initialFormState);
};


export default function EmprestimoForm() { 
    
    const userId = localStorage.getItem("userId");
    
    const [emprestimos, setEmprestimos] = useState([]); 
    const [showLoanModal, setShowLoanModal] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [isLoading, setIsLoading] = useState(true); 

    // 💡 NOVO ESTADO PARA O MODAL DE EXCLUSÃO
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    const initialLoanFormState = {
        id: null, 
        tipo: "",
        banco: "", 
        valor: "",
        juros: "",
        parcelas: "",
        dataInicio: moment().format("YYYY-MM-DD"),
        descricao: "",
        parcelasPagas: "0",
    };
    const [loanForm, setLoanForm] = useState(initialLoanFormState);

    // Funções de Fechamento de Modal padronizadas
    const handleCloseModal = useCallback(() => {
        closeAndResetModal(setShowLoanModal, setIsEditing, setLoanForm, initialLoanFormState);
    }, []);


    // ----------------------------------------------------
    // --- FUNÇÕES DE INTEGRAÇÃO COM A API (CRUD) ---
    // ----------------------------------------------------

    const fetchEmprestimos = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await EmprestimoService.getEmprestimos();
            
            const dataWithPMT = response.data.map(loan => ({
                ...loan,
                id: loan._id, 
                valorParcelaMensal: calcularValorParcela(loan.valor, loan.juros, loan.parcelas),
            }));

            dataWithPMT.sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio));
            setEmprestimos(dataWithPMT);
        } catch (e) {
            console.error("Erro ao carregar empréstimos:", e);
            window.alert(`Falha ao carregar empréstimos: ${e.response?.data?.message || 'Verifique sua conexão.'}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId]); 

    useEffect(() => {
        if (userId) {
            fetchEmprestimos();
        }
    }, [fetchEmprestimos, userId]); 


    // --- Funções de Cadastro/Edição de Empréstimo ---

    function handleChange(e) {
        const { name, value } = e.target;
        setLoanForm({ ...loanForm, [name]: value });
    }

    function handleOpenEditModal(loan) {
        const currentId = loan.id; 

        setLoanForm({ 
            id: currentId,
            tipo: loan.tipo,
            banco: loan.banco,
            valor: String(loan.valor),
            juros: String(loan.juros),
            parcelas: String(loan.parcelas),
            dataInicio: moment(loan.dataInicio).format("YYYY-MM-DD"),
            descricao: loan.descricao,
            parcelasPagas: String(loan.parcelasPagas),
        });
        setIsEditing(true);
        setShowLoanModal(true);
    }
    
    async function handleSaveEmprestimo(e) {
        e.preventDefault();
        
        if (!userId) {
            window.alert("Atenção: O usuário não está logado. Não é possível salvar empréstimo.");
            return;
        }

        const valorTotal = parseFloat(loanForm.valor) || 0;
        const taxaJuros = parseFloat(loanForm.juros) || 0;
        const numParcelas = parseInt(loanForm.parcelas, 10) || 0;
        const parcelasPagas = parseInt(loanForm.parcelasPagas, 10) || 0;

        if (!loanForm.tipo || valorTotal <= 0 || taxaJuros < 0 || numParcelas <= 0 || parcelasPagas > numParcelas) {
            window.alert("Validação: Verifique os campos obrigatórios (Tipo, Valor, Juros, Parcela) ou o status de parcelas pagas.");
            return;
        }

        const payload = {
            userId: userId, 
            tipo: loanForm.tipo,
            banco: loanForm.banco,
            valor: valorTotal,
            juros: taxaJuros,
            parcelas: numParcelas,
            dataInicio: loanForm.dataInicio,
            descricao: loanForm.descricao,
            parcelasPagas: parcelasPagas,
        };

        try {
            if (isEditing) {
                await EmprestimoService.updateEmprestimo(loanForm.id, payload);
                

            } else {
                await EmprestimoService.createEmprestimo(payload);
               
            }
        
            fetchEmprestimos(); 
            handleCloseModal(); 

        } catch (error) {
            console.error('Erro ao salvar empréstimo:', error);
            window.alert(`Erro ao salvar empréstimo: ${error.response?.data?.message || 'Erro desconhecido.'}`);
        }
    }

    // --- Funções de Gerenciamento de Exclusão (NOVAS/AJUSTADAS) ---

    // 💡 Abre o modal de exclusão e armazena o ID
    const handleOpenDeleteModal = (id) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    // 💡 Fecha o modal de exclusão e limpa o ID
    const handleCloseDeleteModal = () => {
        setIdToDelete(null);
        setShowDeleteModal(false);
    };

    // 💡 Executa a exclusão após a confirmação no modal
    async function handleConfirmDelete() {
        if (!idToDelete) return;

        try {
            await EmprestimoService.deleteEmprestimo(idToDelete);
            
            fetchEmprestimos(); 
            
        } catch (e) {
            console.error("Erro ao deletar empréstimo:", e);
            window.alert(`Erro ao deletar: ${e.response?.data?.message || 'Erro de conexão.'}`);
        } finally {
            // Garante que o modal feche após a tentativa
            handleCloseDeleteModal();
        }
    }


    const getParcelaMensal = useCallback((emprestimo) => {
        return formatValue(emprestimo.valorParcelaMensal);
    }, []);

    const modalTitle = isEditing ? "Editar Empréstimo/Financiamento" : "Cadastrar Novo Empréstimo/Financiamento";


    // --- Renderização ---
    return (
        <div className="emprestimo-manager">
            
            {/* 1. Toggle Bar com Botão do Modal */}
            <div className="form-toggle-bar">
                <h3 className="form-toggle-title">Gerenciamento de Empréstimos e Financiamentos</h3>
                <button 
                    className="toggle-form-btn" 
                    onClick={() => { 
                        setLoanForm(initialLoanFormState); 
                        setIsEditing(false); 
                        setShowLoanModal(true); 
                    }}
                >
                    <FiPlus size={20} />
                    Novo Empréstimo
                </button>
            </div>

            {/* 2. Modal de Cadastro/Edição de Empréstimo */}
            {showLoanModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{modalTitle}</h2>
                            <button className="close-modal-btn" onClick={handleCloseModal}><FiX size={24} /></button>
                        </div>
                        
                        <form className="form cadastro-form" onSubmit={handleSaveEmprestimo}>
                            <div className="form-grid">
                                <input name="tipo" placeholder="Tipo (Ex: Pessoal, Imobiliário)*" value={loanForm.tipo} onChange={handleChange} required />
                                <input name="banco" placeholder="Banco/Fonte" value={loanForm.banco} onChange={handleChange} />
                                <input name="valor" type="number" step="0.01" placeholder="Valor Total Emprestado (R$)*" value={loanForm.valor} onChange={handleChange} required />
                                <input name="juros" type="number" step="0.01" placeholder="Juros Mensal (%)*" value={loanForm.juros} onChange={handleChange} required />
                                <input name="parcelas" type="number" placeholder="Total de Parcelas*" value={loanForm.parcelas} onChange={handleChange} required />
                                <input name="dataInicio" type="date" value={loanForm.dataInicio} onChange={handleChange} required />
                                <input name="parcelasPagas" type="number" placeholder="Parcelas Já Pagas (0)" value={loanForm.parcelasPagas} onChange={handleChange} />
                                <div className="input-placeholder"></div>
                            </div>

                            <textarea 
                                name="descricao" 
                                placeholder="Detalhes e observações" 
                                value={loanForm.descricao} 
                                onChange={handleChange}>
                            </textarea>
                            <div className="confirm-actions">
                                <button className="btn-secondary" onClick={handleCloseModal} type="button">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Atualizar Empréstimo' : 'Salvar Empréstimo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🚨 NOVO: Modal de Confirmação de Exclusão (Replicando o padrão do receita.js) */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirmation">
                        <div className="modal-header">
                            <h2>Confirmar Exclusão</h2>
                            <button className="close-modal-btn" onClick={handleCloseDeleteModal}><FiX size={24} /></button>
                        </div>
                        
                        <div className="modal-body">
                            <p>Tem certeza que deseja deletar este registro de Empréstimo/Financiamento? Esta ação não pode ser desfeita.</p>
                        </div>
                        
                        <div className="confirm-actions">
                            <button className="btn-secondary" onClick={handleCloseDeleteModal}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-danger" 
                                onClick={handleConfirmDelete}
                            >
                                <FiTrash2 size={16} /> Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* 3. Lista de Empréstimos Existentes */}
            <h3 className="list-title"><FiHome size={24} /> Empréstimos / Financiamentos ({emprestimos.length})</h3>
            
            <div className="receitas-lista emprestimos-lista">
                {isLoading ? (
                    <p className="lista-carregando">Carregando empréstimos...</p>
                ) : emprestimos.length === 0 ? (
                    <p className="lista-vazia">Nenhum empréstimo cadastrado.</p>
                ) : (
                    <div className="tabela-container">
                        <table>
                            <thead>
                                <tr>
                                    <th className="tipo-col">Tipo / Banco</th>
                                    <th className="valor-total-col valor-col">Valor Total</th>
                                    <th className="parcela-col valor-col">Parcela Mensal</th>
                                    <th className="status-col">Status</th>
                                    <th className="acoes-col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emprestimos.map((e) => (
                                    <tr key={e.id} className="emprestimo-item">
                                        <td>
                                            <strong>{e.tipo}</strong>
                                            <span className="fonte-subtext">
                                                Fonte: {e.banco || 'N/A'} (Juros: {e.juros}%/mês)
                                            </span>
                                        </td>
                                        <td className="valor-col">
                                            {formatValue(e.valor)}
                                        </td>
                                        <td className="valor-col valor-negativo">
                                            {getParcelaMensal(e)}
                                        </td>
                                        <td>
                                            {e.parcelasPagas}/{e.parcelas} pagas
                                            <span className="fonte-subtext">Restam: {e.parcelas - e.parcelasPagas} meses</span>
                                        </td>
                                        <td className="acoes-col">
                                            <button 
                                                onClick={() => handleOpenEditModal(e)} 
                                                className="action-btn edit-btn"
                                                aria-label="Editar"
                                            >
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button 
                                                // 💡 ALTERADO: Chama o novo handler para abrir o modal de exclusão
                                                onClick={() => handleOpenDeleteModal(e.id)} 
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