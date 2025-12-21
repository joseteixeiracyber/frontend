import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiFileText, FiCheckCircle } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Impostos ---
const initialTaxes = [
  { 
    id: 801, 
    tipo: "IPTU (Anual)", 
    valor: 2500.00, 
    vencimento: "2026-03-05", 
    dataPagamento: null, // Ainda não pago
    recorrente: "Sim", 
    descricao: "Imposto sobre a propriedade urbana.",
    status: "Pendente"
  },
  { 
    id: 802, 
    tipo: "IRPF (DARF)", 
    valor: 450.00, 
    vencimento: "2025-12-15", 
    dataPagamento: "2025-12-08", 
    recorrente: "Não", 
    descricao: "DARF de imposto mensal sobre ganhos.",
    status: "Pago"
  },
  { 
    id: 803, 
    tipo: "IPVA (1ª Parcela)", 
    valor: 350.00, 
    vencimento: "2026-01-20", 
    dataPagamento: null, 
    recorrente: "Sim", 
    descricao: "Primeira parcela do IPVA do carro.",
    status: "Pendente"
  },
];
// -------------------------

// Função de Formatação de Moeda
const formatValue = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 'R$ 0,00'; 
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ImpostosForm() { 
  // Ordena os impostos iniciais por vencimento
  const sortedInitialTaxes = initialTaxes.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

  const [impostos, setImpostos] = useState(sortedInitialTaxes);
  const [showModal, setShowModal] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar Edição
  
  const initialFormState = {
    tipo: "",
    valor: "",
    vencimento: moment().add(30, 'days').format("YYYY-MM-DD"), // Padrão: 30 dias
    dataPagamento: "", // Campo opcional (usar string vazia para controle)
    recorrente: "Não",
    descricao: "",
    id: null, // Inclui ID para edição
  };

  const [form, setForm] = useState(initialFormState);
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  // Lógica de Cadastro e Edição unificada
  function handleSubmit(e) {
    e.preventDefault();

    if (!form.tipo || !form.valor || !form.vencimento) {
        alert("Preencha os campos obrigatórios: Tipo, Valor e Vencimento.");
        return;
    }
    
    // Define o status baseado na data de pagamento (se vazio, é Pendente)
    const status = form.dataPagamento ? "Pago" : "Pendente";
    
    // Converte null/undefined/"" para null para consistência no estado
    const dataPagamentoFinal = form.dataPagamento || null; 

    const impostoData = {
      ...form,
      valor: parseFloat(form.valor), 
      status: status,
      dataPagamento: dataPagamentoFinal,
    };
    
    let newImpostos;
    
    if (isEditing) {
        // Lógica de Edição
        newImpostos = impostos.map(i => i.id === form.id ? impostoData : i);
    } else {
        // Lógica de Cadastro
        impostoData.id = Date.now();
        newImpostos = [...impostos, impostoData];
    }

    // Adiciona/Atualiza e ordena pela data de vencimento
    setImpostos(newImpostos.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setIsEditing(false);
    setShowModal(false); 
  }
  
  // Função para abrir modal em modo de Edição
  function handleEditImposto(id) {
    const impostoToEdit = impostos.find(i => i.id === id);
    if (impostoToEdit) {
        // Pré-preenche o formulário para edição
        setForm({ 
            ...impostoToEdit, 
            valor: impostoToEdit.valor.toString(), // Converte valor para string para o input type="number"
            // Garante que dataPagamento é string vazia se for null, para o input type="date"
            dataPagamento: impostoToEdit.dataPagamento || "", 
        });
        setIsEditing(true);
        setShowModal(true);
    }
  }


  // --- Funções de Gerenciamento ---

  function handleDeleteImposto(id) {
    if (window.confirm("Tem certeza que deseja deletar este imposto?")) {
      setImpostos(impostos.filter(i => i.id !== id));
    }
  }

  // Marca um imposto como pago na data de hoje
  function handleMarkAsPaid(id) {
      setImpostos(impostos.map(i => {
          if (i.id === id) {
              return { ...i, status: "Pago", dataPagamento: moment().format("YYYY-MM-DD") };
          }
          return i;
      }).sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))); // Reordena
  }

  // Obtém a classe de cor e status
  const getTaxStatusClass = (imposto) => {
      if (imposto.status === 'Pago') return 'tax-paid';
      
      const today = moment().startOf('day');
      const vencimento = moment(imposto.vencimento).startOf('day');
      
      if (vencimento.isBefore(today)) {
          return 'tax-overdue'; // Vencido (Vermelho)
      } else if (vencimento.diff(today, 'days') <= 7) {
          return 'tax-warning'; // Próximo do Vencimento (Amarelo)
      }
      return ''; // Normal
  };


  // --- Renderização ---
  return (
    <div className="impostos-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Impostos e Tributos</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => { setForm(initialFormState); setIsEditing(false); setShowModal(true); }} // Resetar antes de abrir
          >
              <FiPlus size={20} />
              Novo Imposto
          </button>
      </div>

      {/* 2. Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>{isEditing ? "Editar Imposto" : "Cadastrar Novo Imposto"}</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                  
                  <input name="tipo" placeholder="Tipo (Ex: IPTU, DARF, IR)*" value={form.tipo} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor (R$)*" value={form.valor} onChange={handleChange} required />
                  
                  {/* Vencimento */}
                  <label>Data de Vencimento *</label>
                  <input name="vencimento" type="date" value={form.vencimento} onChange={handleChange} required />
                  
                  {/* Recorrência */}
                  <select name="recorrente" value={form.recorrente} onChange={handleChange}>
                    <option value="Não">Não Recorrente (Pontual)</option>
                    <option value="Sim">Sim (Mensal, Anual, etc.)</option>
                  </select>
                  
                  {/* Data de Pagamento */}
                  <label>Data de Pagamento (Opcional)</label>
                  <input name="dataPagamento" type="date" value={form.dataPagamento} onChange={handleChange} />

              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Parcela, Referência)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>
              
              <div className="confirm-actions">
                  <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setShowModal(false)}
                  >
                      Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {isEditing ? "Salvar Alterações" : "Salvar Imposto"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Impostos Existentes */}
      <h3 className="list-title"><FiFileText size={24} /> Impostos e Tributos ({impostos.length})</h3>

      <div className="receitas-lista impostos-lista">
        {impostos.length === 0 ? (
          <p className="lista-vazia">Nenhum imposto cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo / Descrição</th>
                  <th className="valor-col">Valor</th>
                  <th className="data-col">Vencimento</th>
                  <th>Status / Pagamento</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {impostos.map((i) => {
                    const statusClass = getTaxStatusClass(i);
                    const isPaid = i.status === 'Pago';
                    
                    return (
                        <tr key={i.id} className={`imposto-item ${statusClass}`}>
                            <td>
                                <strong>{i.tipo}</strong>
                                <span className="fonte-subtext">{i.descricao}</span>
                            </td>
                            <td className="valor-col valor-negativo">
                                {formatValue(i.valor)}
                            </td>
                            <td className="data-col">
                                {moment(i.vencimento).format("DD/MM/YYYY")}
                            </td>
                            <td>
                                <span className={`status-tag ${statusClass}`}>
                                    {isPaid ? <><FiCheckCircle size={12} /> Pago </> : i.status}
                                </span>
                                {isPaid && (
                                  <span className="fonte-subtext">em {moment(i.dataPagamento).format("DD/MM/YYYY")}</span>
                                )}
                                {!isPaid && (
                                  <span className="fonte-subtext">({i.recorrente})</span>
                                )}
                            </td>
                            <td className="acoes-col">
                            {i.status === 'Pendente' && (
                                <button 
                                    onClick={() => handleMarkAsPaid(i.id)} 
                                    className="action-btn pay-btn"
                                    aria-label="Marcar como Pago"
                                >
                                    Pagar
                                </button>
                            )}
                            <button 
                                onClick={() => handleEditImposto(i.id)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteImposto(i.id)} 
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