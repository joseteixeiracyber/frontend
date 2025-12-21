import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiGift } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Cashback ---
const initialCashback = [
  { 
    id: 901, 
    origem: "Nubank Rewards", 
    valor: 15.50, 
    data: "2025-12-01", 
    descricao: "Resgate de pontos de compras de novembro.",
    status: "Creditado"
  },
  { 
    id: 902, 
    origem: "Méliuz (Compra Online)", 
    valor: 45.99, 
    data: "2025-11-20", 
    descricao: "Cashback de 5% em compra na Loja X.",
    status: "Pendente"
  },
  { 
    id: 903, 
    origem: "Cartão C6", 
    valor: 20.00, 
    data: "2025-12-05", 
    descricao: "Crédito de fatura por uso.",
    status: "Creditado"
  },
];
// -------------------------

export default function CashbackForm() { 
  const [cashbacks, setCashbacks] = useState(initialCashback);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    origem: "",
    valor: "",
    data: moment().format("YYYY-MM-DD"),
    descricao: "",
    status: "Creditado" // Padrão
  };

  const [form, setForm] = useState(initialFormState);
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddCashback(e) {
    e.preventDefault();

    if (!form.origem || !form.valor || !form.data) {
        alert("Preencha os campos obrigatórios: Origem, Valor e Data.");
        return;
    }
    
    // Lógica para cadastrar
    const newCashback = {
      ...form,
      id: Date.now(), 
      valor: parseFloat(form.valor), 
    };

    // Adiciona e ordena pela data mais recente
    setCashbacks([...cashbacks, newCashback].sort((a, b) => new Date(b.data) - new Date(a.data)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteCashback(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de cashback?")) {
      setCashbacks(cashbacks.filter(c => c.id !== id));
    }
  }

  // Obtém a classe de status
  const getStatusClass = (status) => {
      return status === 'Creditado' ? 'cashback-credited' : 'cashback-pending';
  };


  // --- Renderização ---
  return (
    <div className="cashback-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Cashback</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Novo Cashback
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Novo Cashback</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddCashback}>
              <div className="form-grid">
                  
                  <input name="origem" placeholder="Origem (Ex: Banco X, Méliuz)" value={form.origem} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor Recebido (R$)*" value={form.valor} onChange={handleChange} required />
                  <input name="data" type="date" value={form.data} onChange={handleChange} required />
                  
                  {/* Status */}
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="Creditado">Creditado na Conta</option>
                    <option value="Pendente">Pendente de Resgate</option>
                  </select>

              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes da compra ou resgate." 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Cashback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Cashbacks Existentes */}
      <h3 className="list-title"><FiGift size={24} /> Créditos de Cashback ({cashbacks.length})</h3>

      <div className="receitas-lista cashbacks-lista">
        {cashbacks.length === 0 ? (
          <p className="lista-vazia">Nenhum cashback registrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Origem / Descrição</th>
                  <th className="valor-col">Valor</th>
                  <th className="data-col">Data</th>
                  <th>Status</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cashbacks.map((c) => {
                    const statusClass = getStatusClass(c.status);
                    
                    return (
                        <tr key={c.id} className={`cashback-item ${statusClass}`}>
                            <td>
                                <strong>{c.origem}</strong>
                                <span className="fonte-subtext">{c.descricao}</span>
                            </td>
                            <td className="valor-col valor-positivo">
                                {c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="data-col">
                                {moment(c.data).format("DD/MM/YYYY")}
                            </td>
                            <td>
                                <span className={`status-tag ${statusClass}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Cashback: ${c.origem}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteCashback(c.id)} 
                                className="action-btn delete-btn"
                                aria-label="Deletar"
                            >
                                <FiTrash2 size={16} />
                            </button>
                            </td>
                        </tr>
                    )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}