import { useState, useEffect, useCallback } from "react"; // Adicionado useEffect e useCallback
import { FiTrash2, FiEdit3, FiPlus, FiX, FiTrendingUp } from "react-icons/fi"; 
import moment from "moment"; 
// 1. IMPORTAR A API
import { InvestimentoService } from "../../services/api"; 

// --- Simulação de Dados REMOVIDA (initialInvestments) ---

export default function InvestimentoForm() { 
    // Obtém o ID do usuário (assumindo que ele está no localStorage)
    const userId = localStorage.getItem("userId"); 
    
    // Estado para armazenar os dados do back-end
    const [investimentos, setInvestimentos] = useState([]);
    const [showModal, setShowModal] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); // NOVO: Controla modo edição
    
    const initialFormState = {
        _id: null, // NOVO: Para guardar o ID do item sendo editado (MongoDB _id)
        ativo: "",
        categoria: "",
        aporte: "",
        data: moment().format("YYYY-MM-DD"),
        rentabilidade: "",
        descricao: ""
    };

    const [form, setForm] = useState(initialFormState);

    const categorias = ["Renda Fixa", "Ações", "Fundos", "Cripto", "Imóveis", "Outros"];

    // ----------------------------------------------------------------------
    // --- LÓGICA DE BUSCA DE DADOS (READ) ---
    // ----------------------------------------------------------------------

    // Função para buscar dados da API
    const fetchInvestimentos = useCallback(async () => {
        if (!userId) {
            console.error("ID do usuário não encontrado. Não é possível buscar investimentos.");
            return;
        }
        try {
            // Chamada à API
            const response = await InvestimentoService.getInvestimentosByUserId(userId);
            
            // Ordena os dados por data antes de salvar no estado
            const sortedData = response.data.sort((a, b) => new Date(b.data) - new Date(a.data));

            setInvestimentos(sortedData);
        } catch (error) {
            console.error("Erro ao carregar investimentos:", error);
            // Em produção, você pode mostrar uma notificação de erro aqui
        }
    }, [userId]);


    // Carregar dados na montagem do componente
    useEffect(() => {
        fetchInvestimentos();
    }, [fetchInvestimentos]);


    // ----------------------------------------------------------------------
    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS (CREATE/UPDATE/DELETE) ---
    // ----------------------------------------------------------------------

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    async function handleSaveInvestimento(e) {
        e.preventDefault();

        if (!form.ativo || !form.categoria || !form.aporte || !form.data) {
            alert("Preencha os campos obrigatórios: Ativo, Categoria, Aporte e Data.");
            return;
        }
        
        // Prepara os dados (limpeza e conversão de tipos)
        const investmentData = {
            userId: userId, // Adiciona o userId, crucial para o back-end
            ativo: form.ativo,
            categoria: form.categoria,
            aporte: parseFloat(form.aporte),
            data: form.data, // Data é enviada como string
            rentabilidade: parseFloat(form.rentabilidade || 0),
            descricao: form.descricao
        };

        try {
            if (isEditing && form._id) {
                // Lógica de EDIÇÃO (UPDATE)
                await InvestimentoService.updateInvestimento(form._id, investmentData);
                alert("Investimento atualizado com sucesso!");
            } else {
                // Lógica de CADASTRO (CREATE)
                await InvestimentoService.createInvestimento(investmentData);
                alert("Investimento cadastrado com sucesso!");
            }

            // Atualiza a lista e fecha o modal
            fetchInvestimentos(); // Re-fetch para obter a lista atualizada do servidor
            setForm(initialFormState); 
            setIsEditing(false);
            setShowModal(false); 

        } catch (error) {
            console.error("Erro ao salvar investimento:", error);
            alert(`Erro ao salvar: ${error.response?.data?.message || error.message}`);
        }
    }


    async function handleDeleteInvestimento(id) {
        if (window.confirm("ATENÇÃO: Tem certeza que deseja deletar este investimento?")) {
            try {
                // Chamada à API DELETE
                await InvestimentoService.deleteInvestimento(id);
                
                alert("Investimento deletado com sucesso!");
                fetchInvestimentos(); // Re-fetch para atualizar a lista
            } catch (error) {
                console.error("Erro ao deletar investimento:", error);
                alert(`Erro ao deletar: ${error.response?.data?.message || error.message}`);
            }
        }
    }

    function handleEditInvestimento(investimento) {
        // Prepara o formulário com os dados do investimento
        setForm({
            _id: investimento._id || investimento.id, // Usa _id do MongoDB, ou id se for o mock antigo
            ativo: investimento.ativo,
            categoria: investimento.categoria,
            // Certifica que aporte e rentabilidade são strings para preencher input[type=number]
            aporte: investimento.aporte.toString(), 
            rentabilidade: investimento.rentabilidade.toString(),
            data: investimento.data,
            descricao: investimento.descricao
        });
        setIsEditing(true);
        setShowModal(true);
    }
    
    // Define a cor da rentabilidade (mantido)
    const getRentabilidadeClass = (rentabilidade) => {
        return rentabilidade >= 0 ? 'rent-positiva' : 'rent-negativa';
    };
        
    // Função para formatar o valor (mantido)
    const formatValue = (value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return 'R$ 0,00'; 
        return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };


    // --- Renderização ---
    return (
        <div className="investimento-manager">
            
            {/* 1. Toggle Bar com Botão do Modal */}
            <div className="form-toggle-bar">
                <h3 className="form-toggle-title">Formulário de Registro de Investimento</h3>
                <button 
                    className="toggle-form-btn" 
                    onClick={() => {
                        setForm(initialFormState); // Limpa o form ao abrir
                        setIsEditing(false); // Garante que está no modo de cadastro
                        setShowModal(true);
                    }} 
                >
                    <FiPlus size={20} />
                    Novo Investimento
                </button>
            </div>

            {/* 2. Modal de Cadastro/Edição */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Investimento' : 'Cadastrar Novo Investimento'}</h2>
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
                        </div>
                        
                        {/* ATUALIZADO: onSubmit agora chama handleSaveInvestimento */}
                        <form className="form cadastro-form" onSubmit={handleSaveInvestimento}>
                            <div className="form-grid">
                                
                                {/* Ativo */}
                                <input name="ativo" placeholder="Nome do Ativo (Ex: ITUB3, Fundo X)" value={form.ativo} onChange={handleChange} required />

                                {/* Categoria */}
                                <select name="categoria" value={form.categoria} onChange={handleChange} required>
                                    <option value="" disabled>Selecione a Categoria *</option>
                                    {categorias.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                
                                {/* Aporte (Valor) */}
                                <input name="aporte" type="number" step="0.01" placeholder="Valor do Aporte (R$)*" value={form.aporte} onChange={handleChange} required />
                                
                                {/* Rentabilidade (%) */}
                                <input name="rentabilidade" type="number" step="0.01" placeholder="Rentabilidade Atual (%)" value={form.rentabilidade} onChange={handleChange} />

                                {/* Data */}
                                <input name="data" type="date" value={form.data} onChange={handleChange} required />
                                
                            </div>

                            <textarea 
                                name="descricao" 
                                placeholder="Observações ou estratégia do investimento" 
                                value={form.descricao} 
                                onChange={handleChange}>
                            </textarea>
                            <div className="confirm-actions">
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Atualizar Investimento' : 'Salvar Investimento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Lista de Investimentos Existentes */}
            <h3 className="list-title"><FiTrendingUp size={24} /> Investimentos Registrados ({investimentos.length})</h3>

            <div className="receitas-lista investimentos-lista">
                {investimentos.length === 0 ? (
                    <p className="lista-vazia">Nenhum investimento cadastrado.</p>
                ) : (
                    <div className="tabela-container">
                        <table>
                            <thead>
                                <tr>
                                    <th className="data-col">Data</th>
                                    <th>Ativo / Descrição</th> 
                                    <th>Categoria</th>
                                    <th className="valor-col">Aporte</th>
                                    <th className="valor-col">Rent. (%)</th>
                                    <th className="acoes-col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investimentos.map((investimento) => (
                                    // NOVO: Usando investimento._id se vier da API, senão o id antigo (para compatibilidade inicial)
                                    <tr key={investimento._id || investimento.id} className="investimento-item">
                                        <td>{moment(investimento.data).format("DD/MM/YYYY")}</td>
                                        <td>
                                            <strong>{investimento.ativo}</strong>
                                            <span className="fonte-subtext">{investimento.descricao}</span>
                                        </td>
                                        <td>{investimento.categoria}</td>
                                        <td className="valor-col valor-positivo"> 
                                            {formatValue(investimento.aporte)}
                                        </td>
                                        <td className={`valor-col ${getRentabilidadeClass(investimento.rentabilidade)}`}>
                                            {/* Garante que o número é exibido corretamente, mesmo que seja 0.0 */}
                                            {parseFloat(investimento.rentabilidade).toFixed(2).replace('.', ',')}%
                                        </td>
                                        <td className="acoes-col">
                                            <button 
                                                onClick={() => handleEditInvestimento(investimento)} 
                                                className="action-btn edit-btn"
                                                aria-label="Editar"
                                            >
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteInvestimento(investimento._id || investimento.id)} 
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