import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiHeart, FiDollarSign } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Saúde ---
const initialHealthExpenses = [
  { 
    id: 1601, 
    tipo: "Consulta - Cardiologista", 
    valor: 350.00, 
    data: "2025-11-15", 
    reembolsoStatus: "Solicitado", // Novo campo
    descricao: "Consulta particular para check-up anual.",
  },
  { 
    id: 1602, 
    tipo: "Medicamentos (Contínuo)", 
    valor: 85.50, 
    data: "2025-12-01", 
    reembolsoStatus: "Não Aplicável", 
    descricao: "Remédio de pressão mensal.",
  },
  { 
    id: 1603, 
    tipo: "Exame de Sangue", 
    valor: 0.00, 
    data: "2025-12-08", 
    reembolsoStatus: "Reembolsado", 
    descricao: "Exame de rotina. Valor total R$ 150,00.",
  },
];
// -------------------------

export default function SaudeForm() { 
  const [despesas, setDespesas] = useState(initialHealthExpenses);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "",
    valor: "",
    data: moment().format("YYYY-MM-DD"),
    reembolsoStatus: "Não Aplicável",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const tiposDespesa = ["Consulta", "Exame", "Medicamento", "Plano de Saúde", "Procedimento"];
  const statusReembolso = ["Não Aplicável", "Pendente", "Solicitado", "Reembolsado", "Negado"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddDespesa(e) {
    e.preventDefault();

    if (!form.tipo || !form.valor || !form.data) {
        alert("Preencha os campos obrigatórios: Tipo, Valor e Data.");
        return;
    }
    
    // Lógica para cadastrar
    const newDespesa = {
      ...form,
      id: Date.now(), 
      valor: parseFloat(form.valor) || 0,
    };

    // Adiciona e ordena pela data mais recente
    setDespesas([...despesas, newDespesa].sort((a, b) => new Date(b.data) - new Date(a.data)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteDespesa(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de despesa de saúde?")) {
      setDespesas(despesas.filter(d => d.id !== id));
    }
  }

  // Define a classe de cor com base no status do reembolso
  const getReimbursementClass = (status) => {
      if (status === 'Reembolsado') return 'reimbursed';
      if (status === 'Solicitado' || status === 'Pendente') return 'reimbursement-pending';
      if (status === 'Negado') return 'reimbursement-denied';
      return 'reimbursement-na';
  };
  
  // Determina se a linha deve ser destacada (despesa não finalizada/pendente)
  const getRowHighlightClass = (status) => {
      if (status === 'Solicitado' || status === 'Pendente') return 'pending-row';
      return '';
  };


  // --- Renderização ---
  return (
    <div className="saude-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Despesas de Saúde</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Nova Despesa
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Despesa de Saúde</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddDespesa}>
              <div className="form-grid">
                  
                  <select name="tipo" value={form.tipo} onChange={handleChange} required>
                    <option value="" disabled>Selecione o Tipo *</option>
                    {tiposDespesa.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <input name="valor" type="number" step="0.01" placeholder="Valor Total (R$)*" value={form.valor} onChange={handleChange} required />
                  <input name="data" type="date" value={form.data} onChange={handleChange} required />
                  
                  <select name="reembolsoStatus" value={form.reembolsoStatus} onChange={handleChange}>
                    {statusReembolso.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Médico, Clínica, Nome do Exame)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Despesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Despesas de Saúde Existentes */}
      <h3 className="list-title"><FiHeart size={24} /> Despesas de Saúde ({despesas.length})</h3>

      <div className="receitas-lista despesas-lista">
        {despesas.length === 0 ? (
          <p className="lista-vazia">Nenhuma despesa de saúde cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="data-col">Data</th>
                  <th>Tipo / Descrição</th>
                  <th className="valor-col">Valor</th>
                  <th>Reembolso</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((d) => (
                  <tr key={d.id} className={`saude-item ${getRowHighlightClass(d.reembolsoStatus)}`}>
                    <td>{moment(d.data).format("DD/MM/YYYY")}</td>
                    <td>
                        <strong>{d.tipo}</strong>
                        <span className="fonte-subtext">{d.descricao}</span>
                    </td>
                    <td className="valor-col valor-negativo">
                        <FiDollarSign size={12} style={{ marginRight: '5px' }} />
                        {d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>
                        <span className={`status-tag ${getReimbursementClass(d.reembolsoStatus)}`}>
                            {d.reembolsoStatus}
                        </span>
                    </td>
                    <td className="acoes-col">
                      <button 
                          onClick={() => alert(`Editar Despesa: ${d.tipo}`)} 
                          className="action-btn edit-btn"
                          aria-label="Editar"
                      >
                          <FiEdit3 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDeleteDespesa(d.id)} 
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