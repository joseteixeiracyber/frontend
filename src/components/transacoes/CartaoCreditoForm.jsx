import { useState, useEffect, useCallback } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiCreditCard } from "react-icons/fi";
import { CartaoService } from "../../services/api"; 

// Função auxiliar para resetar o estado do formulário
const initialFormState = {
    _id: null, // Para guardar o ID do item sendo editado (MongoDB _id)
    nome: "",
    limite: "",
    faturaAtual: "",
    vencimento: "", // Dia do vencimento (1 a 31)
    juros: "",
    descricao: "",
    // 💡 AJUSTE: Campos para simular o rastreamento de parcelas
    parcelas: "", 
    parcelasPagas: "0",
};

export default function CartaoCreditoForm() {
    // Obtém o ID do usuário (assumindo que ele está no localStorage)
    const userId = localStorage.getItem("userId"); 
    
    // Estado para armazenar os dados do back-end
    const [cartoes, setCartoes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Controla modo edição
    
    const [form, setForm] = useState(initialFormState);

    // 💡 NOVO ESTADO: Modal de Confirmação de Exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    // --- Funções Auxiliares ---
    
    const formatValue = (value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return 'R$ 0,00'; 
        return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    function handleCloseAndResetModal() {
        setForm(initialFormState);
        setIsEditing(false);
        setShowModal(false);
    }

    // ----------------------------------------------------------------------
    // --- LÓGICA DE BUSCA DE DADOS (READ) ---
    // ----------------------------------------------------------------------

    const fetchCartoes = useCallback(async () => {
        if (!userId) {
            console.error("ID do usuário não encontrado. Não é possível buscar cartões.");
            return;
        }
        try {
            // Chamada à API para obter cartões do usuário
            // Usando getCartoes() que busca o userId do localStorage
            const response = await CartaoService.getCartoes();
            
            // 💡 AJUSTE: Garantir que os campos de parcela existam, mesmo que vazios/nulos no DB
            const data = response.data.map(card => ({
                ...card,
                parcelas: card.parcelas || 0,
                parcelasPagas: card.parcelasPagas || 0
            }));

            setCartoes(data);
        } catch (error) {
            console.error("Erro ao carregar cartões:", error);
            window.alert("Falha ao carregar os cartões. Verifique o servidor.");
        }
    }, [userId]);

    // Carregar dados na montagem do componente
    useEffect(() => {
        fetchCartoes();
    }, [fetchCartoes]);

    // ----------------------------------------------------------------------
    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (CREATE/UPDATE/DELETE) ---
    // ----------------------------------------------------------------------

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    async function handleSaveCartao(e) {
        e.preventDefault();
        
        const numParcelas = parseInt(form.parcelas, 10) || 0;
        const parcelasPagas = parseInt(form.parcelasPagas, 10) || 0;

        // 💡 AJUSTE: Validação para evitar parcelas pagas > parcelas totais
        if (!form.nome || !form.limite || !form.vencimento || parcelasPagas > numParcelas) {
            window.alert("Validação: Preencha os campos obrigatórios (Nome, Limite e Vencimento) corretamente, e verifique o status de parcelas pagas.");
            return;
        }
        
        // Prepara os dados (limpeza e conversão de tipos)
        const cardData = {
            userId: userId, 
            nome: form.nome,
            limite: parseFloat(form.limite),
            faturaAtual: parseFloat(form.faturaAtual || 0),
            vencimento: parseInt(form.vencimento, 10),
            juros: parseFloat(form.juros || 0),
            descricao: form.descricao,
            // 💡 AJUSTE: Inclui os dados de parcela no payload
            parcelas: numParcelas, 
            parcelasPagas: parcelasPagas, 
        };

        try {
            if (isEditing && form._id) {
                // Lógica de EDIÇÃO (UPDATE)
                await CartaoService.updateCartao(form._id, cardData);
                // window.alert("Cartão atualizado com sucesso!");
            } else {
                // Lógica de CADASTRO (CREATE)
                await CartaoService.createCartao(cardData);
                // window.alert("Cartão cadastrado com sucesso!");
            }

            // Atualiza a lista e fecha o modal
            fetchCartoes(); 
            handleCloseAndResetModal();

        } catch (error) {
            console.error("Erro ao salvar cartão:", error.response?.data || error);
            const errorMsg = error.response?.data?.msg || "Erro de conexão ou validação no servidor.";
            window.alert(`Falha ao salvar o cartão: ${errorMsg}`);
        }
    }


    // --- Funções de Gerenciamento de Exclusão (ADICIONADAS) ---

    // 💡 Adiciona Modal de Exclusão (copiado do EmprestimoForm)
    const handleOpenDeleteModal = (id) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setIdToDelete(null);
        setShowDeleteModal(false);
    };

    async function handleConfirmDelete() {
        if (!idToDelete) return;

        try {
            await CartaoService.deleteCartao(idToDelete);
            
            fetchCartoes(); 
            
        } catch (e) {
            console.error("Erro ao deletar cartão:", e);
            window.alert(`Erro ao deletar: ${e.response?.data?.message || 'Erro de conexão.'}`);
        } finally {
            handleCloseDeleteModal();
        }
    }
    // --- Fim das Funções de Exclusão ---


    function handleEditCartao(cartao) {
        // Prepara o formulário com os dados do cartão
        setForm({
            _id: cartao._id,
            nome: cartao.nome,
            limite: String(cartao.limite), 
            faturaAtual: String(cartao.faturaAtual),
            vencimento: String(cartao.vencimento),
            juros: String(cartao.juros),
            descricao: cartao.descricao,
            // 💡 AJUSTE: Inclui os dados de parcela para edição
            parcelas: String(cartao.parcelas), 
            parcelasPagas: String(cartao.parcelasPagas),
        });
        setIsEditing(true);
        setShowModal(true);
    }
    
    // --- Renderização ---
    const modalTitle = isEditing ? "Editar Cartão de Crédito" : "Cadastrar Novo Cartão";
    
    return (
        <div className="cartao-credito-manager">
            
            {/* 1. Toggle Bar com Botão do Modal */}
            <div className="form-toggle-bar">
                <h3 className="form-toggle-title">Gerenciamento de Cartões de Crédito</h3>
                <button 
                    className="toggle-form-btn" 
                    onClick={() => {
                        handleCloseAndResetModal(); // Limpa e fecha modal
                        setShowModal(true); // Abre o modal
                    }} 
                >
                    <FiPlus size={20} />
                    Novo Cartão
                </button>
            </div>

            {/* 2. Modal de Cadastro/Edição de Cartão */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{modalTitle}</h2>
                            <button className="close-modal-btn" onClick={handleCloseAndResetModal}><FiX size={24} /></button>
                        </div>
                        
                        <form className="form cadastro-form" onSubmit={handleSaveCartao}>
                            <div className="form-grid">
                                
                                <input name="nome" placeholder="Nome do Cartão (Ex: Nubank)*" value={form.nome} onChange={handleChange} required />
                                <input name="limite" type="number" step="0.01" placeholder="Limite Total (R$)*" value={form.limite} onChange={handleChange} required />
                                <input name="faturaAtual" type="number" step="0.01" placeholder="Fatura Atual (R$)" value={form.faturaAtual} onChange={handleChange} />
                                <input name="vencimento" type="number" min="1" max="31" placeholder="Dia Vencimento (1 a 31)*" value={form.vencimento} onChange={handleChange} required />
                                <input name="juros" type="number" step="0.01" placeholder="Juros Rotativo (%)" value={form.juros} onChange={handleChange} />
                                <div className="input-placeholder"></div>
                                
                                {/* 💡 AJUSTE: Campos de Parcela */}
                                <input name="parcelas" type="number" placeholder="Total de Parcelas (Opcional)" value={form.parcelas} onChange={handleChange} />
                                <input name="parcelasPagas" type="number" placeholder="Parcelas Já Pagas (0)" value={form.parcelasPagas} onChange={handleChange} />
                                <div className="input-placeholder"></div>

                            </div>

                            <textarea 
                                name="descricao" 
                                placeholder="Observações sobre o cartão (Ex: anuidade, benefícios)" 
                                value={form.descricao} 
                                onChange={handleChange}>
                            </textarea>
                            <div className="confirm-actions">
                                <button 
                                    className="btn-secondary" 
                                    onClick={handleCloseAndResetModal}
                                    type="button" 
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Atualizar Cartão' : 'Salvar Cartão'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* 💡 AJUSTE: Modal de Confirmação de Exclusão (Copiado do EmprestimoForm) */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirmation">
                        <div className="modal-header">
                            <h2>Confirmar Exclusão</h2>
                            <button className="close-modal-btn" onClick={handleCloseDeleteModal}><FiX size={24} /></button>
                        </div>
                        
                        <div className="modal-body">
                            <p>Tem certeza que deseja deletar este Cartão de Crédito? Esta ação não pode ser desfeita.</p>
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


            {/* 3. Lista de Cartões Existentes */}
            <h3 className="list-title"><FiCreditCard size={24} /> Cartões Registrados ({cartoes.length})</h3>

            <div className="receitas-lista cartoes-lista">
                {cartoes.length === 0 ? (
                    <p className="lista-vazia">Nenhum cartão cadastrado.</p>
                ) : (
                    <div className="tabela-container">
                        <table>
                            <thead>
                                <tr>
                                    <th className="card-col">Nome / Limite</th>
                                    <th className="venc-col">Vencimento</th>
                                    <th className="fatura-col valor-col">Fatura Atual</th>
                                    {/* 💡 AJUSTE: Nova Coluna de Status */}
                                    <th className="status-col">Status (Parcelas)</th>
                                    <th className="juros-col">Juros Rotativo (%)</th>
                                    <th className="acoes-col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartoes.map((cartao) => {
                                    const totalParcelas = parseInt(cartao.parcelas, 10);
                                    const parcelasPagas = parseInt(cartao.parcelasPagas, 10);
                                    const statusDisplay = totalParcelas > 0 
                                        ? `${parcelasPagas}/${totalParcelas} pagas`
                                        : 'N/A'; // Se não houver parcelas registradas
                                    const mesesRestantes = totalParcelas - parcelasPagas;

                                    return (
                                        <tr key={cartao._id} className="cartao-item"> 
                                            <td>
                                                <strong>{cartao.nome}</strong>
                                                <span className="fonte-subtext">Limite: {formatValue(cartao.limite)}</span>
                                            </td>
                                            <td>Dia {cartao.vencimento}</td>
                                            <td className="valor-col valor-negativo">
                                                {formatValue(cartao.faturaAtual)}
                                            </td>
                                            {/* 💡 AJUSTE: Exibição do Status da Parcela */}
                                            <td>
                                                {statusDisplay}
                                                {totalParcelas > 0 && (
                                                    <span className="fonte-subtext">Restam: {mesesRestantes > 0 ? `${mesesRestantes} meses` : 'Quitado'}</span>
                                                )}
                                            </td>
                                            <td className="valor-col">
                                                {parseFloat(cartao.juros).toFixed(2).replace('.', ',')}%
                                            </td>
                                            <td className="acoes-col">
                                                <button 
                                                    onClick={() => handleEditCartao(cartao)} 
                                                    className="action-btn edit-btn"
                                                    aria-label="Editar"
                                                >
                                                    <FiEdit3 size={16} />
                                                </button>
                                                <button 
                                                    // 💡 AJUSTE: Usa o novo handler do modal de exclusão
                                                    onClick={() => handleOpenDeleteModal(cartao._id)} 
                                                    className="action-btn delete-btn"
                                                    aria-label="Deletar"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}