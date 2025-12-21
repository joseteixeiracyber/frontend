import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiShield } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Seguros ---
const initialInsurance = [
  { 
    id: 1201, 
    tipo: "Automóvel (Carro X)", 
    seguradora: "Porto Seguro",
    valorPremio: 200.00, // Valor da Parcela/Mês
    vencimentoParcela: "2026-01-10", 
    vencimentoApolice: "2026-07-01", 
    formaPagamento: "Mensal",
    descricao: "Cobertura completa, franquia R$ 3.000.",
    status: "Ativo"
  },
  { 
    id: 1202, 
    tipo: "Residencial (Casa)", 
    seguradora: "BB Seguros",
    valorPremio: 60.00, 
    vencimentoParcela: "2025-12-25", 
    vencimentoApolice: "2027-01-01", 
    formaPagamento: "Mensal",
    descricao: "Incêndio e danos elétricos.",
    status: "Ativo"
  },
];
// -------------------------

export default function SegurosForm() { 
  const [seguros, setSeguros] = useState(initialInsurance);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "",
    seguradora: "",
    valorPremio: "",
    vencimentoParcela: moment().add(30, 'days').format("YYYY-MM-DD"),
    vencimentoApolice: moment().add(1, 'year').format("YYYY-MM-DD"),
    formaPagamento: "Mensal",
    descricao: "",
    status: "Ativo"
  };

  const [form, setForm] = useState(initialFormState);
  
  const formasPagamento = ["Mensal", "Anual (Única Parcela)", "Trimestral"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddSeguro(e) {
    e.preventDefault();

    if (!form.tipo || !form.valorPremio || !form.vencimentoApolice) {
        alert("Preencha os campos obrigatórios: Tipo, Valor do Prêmio e Vencimento da Apólice.");
        return;
    }
    
    // Lógica para cadastrar
    const newSeguro = {
      ...form,
      id: Date.now(), 
      valorPremio: parseFloat(form.valorPremio), 
    };

    // Adiciona e ordena pelo vencimento da apólice mais próximo
    setSeguros([...seguros, newSeguro].sort((a, b) => new Date(a.vencimentoApolice) - new Date(b.vencimentoApolice)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteSeguro(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de seguro?")) {
      setSeguros(seguros.filter(s => s.id !== id));
    }
  }

  // Obtém a classe de cor com base no vencimento da Apólice
  const getPolicyStatusClass = (seguro) => {
      if (seguro.status !== 'Ativo') return 'policy-inactive'; // Ex: Cancelado
      
      const today = moment().startOf('day');
      const vencimento = moment(seguro.vencimentoApolice).startOf('day');
      
      const daysUntilRenewal = vencimento.diff(today, 'days');
      
      if (daysUntilRenewal < 0) {
          return 'policy-expired'; // Vencido (Vermelho)
      } else if (daysUntilRenewal <= 60) {
          return 'policy-warning'; // Próximo da Renovação (Amarelo)
      }
      return ''; // Normal (Ativo)
  };


  // --- Renderização ---
  return (
    <div className="seguros-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Seguros</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Novo Seguro
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Cadastrar Novo Seguro</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddSeguro}>
              <div className="form-grid">
                  
                  <input name="tipo" placeholder="Tipo (Ex: Auto, Vida, Residencial)*" value={form.tipo} onChange={handleChange} required />
                  <input name="seguradora" placeholder="Seguradora/Corretora" value={form.seguradora} onChange={handleChange} />
                  <input name="valorPremio" type="number" step="0.01" placeholder="Valor do Prêmio (Parc./Mês)*" value={form.valorPremio} onChange={handleChange} required />
                  
                  <select name="formaPagamento" value={form.formaPagamento} onChange={handleChange}>
                    {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  {/* Vencimento da Parcela */}
                  <label>Vencimento Próxima Parcela</label>
                  <input name="vencimentoParcela" type="date" value={form.vencimentoParcela} onChange={handleChange} />
                  
                  {/* Vencimento da Apólice */}
                  <label>Vencimento da Apólice *</label>
                  <input name="vencimentoApolice" type="date" value={form.vencimentoApolice} onChange={handleChange} required />
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes da cobertura e franquia." 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Seguro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Seguros Existentes */}
      <h3 className="list-title"><FiShield size={24} /> Seguros e Proteção ({seguros.length})</h3>

      <div className="receitas-lista seguros-lista">
        {seguros.length === 0 ? (
          <p className="lista-vazia">Nenhum seguro cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Seguro / Seguradora</th>
                  <th className="valor-col">Prêmio</th>
                  <th>Venc. Parcela</th>
                  <th>Venc. Apólice (Status)</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {seguros.map((s) => {
                    const statusClass = getPolicyStatusClass(s);
                    
                    return (
                        <tr key={s.id} className={`seguro-item ${statusClass}`}>
                            <td>
                                <strong>{s.tipo}</strong>
                                <span className="fonte-subtext">{s.seguradora} - {s.descricao}</span>
                            </td>
                            <td className="valor-col valor-negativo">
                                {s.valorPremio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                <span className="fonte-subtext">({s.formaPagamento})</span>
                            </td>
                            <td>
                                {moment(s.vencimentoParcela).format("DD/MM/YYYY")}
                            </td>
                            <td>
                                {moment(s.vencimentoApolice).format("DD/MM/YYYY")}
                                <span className={`fonte-subtext status-indicator ${statusClass}`}>
                                    {statusClass === 'policy-expired' ? 'Vencido!' : statusClass === 'policy-warning' ? 'Renovação Próxima' : 'Ativo'}
                                </span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Seguro: ${s.tipo}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteSeguro(s.id)} 
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