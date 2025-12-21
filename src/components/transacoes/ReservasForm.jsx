import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiTarget, FiCheckCircle } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Reservas ---
const initialReserves = [
  { 
    id: 601, 
    objetivo: "Reserva de Emergência", 
    valorAtual: 8000.00, // Valor já reservado
    valorObjetivo: 15000.00, // Meta total
    dataLimite: "2026-12-31", 
    prioridade: "Alta", 
    descricao: "6 meses de custos fixos.",
  },
  { 
    id: 602, 
    objetivo: "Viagem de Férias (2027)", 
    valorAtual: 1500.00,
    valorObjetivo: 6000.00,
    dataLimite: "2027-07-01", 
    prioridade: "Média", 
    descricao: "Fundos para a viagem de verão.",
  },
  { 
    id: 603, 
    objetivo: "Troca de Computador", 
    valorAtual: 5000.00,
    valorObjetivo: 5000.00,
    dataLimite: "2025-12-25", 
    prioridade: "Baixa", 
    descricao: "Meta concluída.",
  },
];
// -------------------------

// Função de Formatação de Moeda
const formatValue = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 'R$ 0,00'; 
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ReservasForm() { 
    // Ordena as reservas iniciais ao carregar (Alta primeiro)
    const sortedInitialReserves = initialReserves.sort((a, b) => {
        const pOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return pOrder[b.prioridade] - pOrder[a.prioridade];
    });
    
  const [reservas, setReservas] = useState(sortedInitialReserves);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    objetivo: "",
    valorAtual: "", // O quanto já foi reservado
    valorObjetivo: "", // O total que se deseja alcançar
    dataLimite: moment().add(1, 'year').format("YYYY-MM-DD"),
    prioridade: "Média",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const prioridades = ["Alta", "Média", "Baixa"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddReserva(e) {
    e.preventDefault();

    const valorAtualFloat = parseFloat(form.valorAtual);
    const valorObjetivoFloat = parseFloat(form.valorObjetivo);

    if (!form.objetivo || isNaN(valorAtualFloat) || isNaN(valorObjetivoFloat)) {
        alert("Preencha os campos obrigatórios: Objetivo, Valor Atual e Valor Objetivo, com valores numéricos válidos.");
        return;
    }
    if (valorObjetivoFloat <= 0) {
        alert("O Valor Objetivo deve ser maior que zero.");
        return;
    }
    // Permite valorAtual > valorObjetivo, pois isso indica meta concluída/excedida

    // Lógica para cadastrar
    const newReserva = {
      ...form,
      id: Date.now(), 
      valorAtual: valorAtualFloat, 
      valorObjetivo: valorObjetivoFloat,
    };

    // Adiciona e ordena por prioridade (Alta primeiro)
    setReservas([...reservas, newReserva].sort((a, b) => {
        const pOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return pOrder[b.prioridade] - pOrder[a.prioridade];
    }));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteReserva(id) {
    if (window.confirm("Tem certeza que deseja deletar esta reserva/meta?")) {
      setReservas(reservas.filter(r => r.id !== id));
    }
  }
  
  // Calcula a porcentagem de progresso
  const getProgress = (current, target) => {
    if (target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  };
  
  // Obtém a classe de cor da prioridade
  const getPriorityClass = (prioridade) => {
      switch (prioridade) {
          case 'Alta': return 'priority-high';
          case 'Média': return 'priority-medium';
          case 'Baixa': return 'priority-low';
          default: return '';
      }
  };


  // --- Renderização ---
  return (
    <div className="reservas-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Gerenciamento de Reservas e Metas</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => { setForm(initialFormState); setShowModal(true); }}
          >
              <FiPlus size={20} />
              Nova Reserva
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Cadastrar Nova Reserva/Meta</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddReserva}>
              <div className="form-grid">
                  
                  <input name="objetivo" placeholder="Objetivo (Ex: Reserva de Emergência)*" value={form.objetivo} onChange={handleChange} required />
                  <input name="valorObjetivo" type="number" step="0.01" placeholder="Valor Objetivo Total (R$)*" value={form.valorObjetivo} onChange={handleChange} required />
                  <input name="valorAtual" type="number" step="0.01" placeholder="Valor Atual Reservado (R$)*" value={form.valorAtual} onChange={handleChange} required />
                  
                  {/* Prioridade */}
                  <select name="prioridade" value={form.prioridade} onChange={handleChange}>
                        <option value="" disabled>Prioridade</option>
                    {prioridades.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  {/* Data Limite */}
                  <label>Data Limite (Previsão)</label>
                  <input name="dataLimite" type="date" value={form.dataLimite} onChange={handleChange} />
                    {/* Campo extra para alinhamento da grid */}
                    <div className="input-placeholder"></div>
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes e estratégia da reserva" 
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
                    Salvar Reserva
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Reservas Existentes */}
      <h3 className="list-title"><FiTarget size={24} /> Reservas e Metas Financeiras ({reservas.length})</h3>

      <div className="receitas-lista reservas-lista">
        {reservas.length === 0 ? (
          <p className="lista-vazia">Nenhuma reserva cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="objetivo-col">Objetivo / Descrição</th>
                  <th className="valor-col">Valor Reservado</th>
                  <th className="progresso-col">Progresso</th>
                  <th className="data-col">Prioridade / Limite</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => {
                    const progress = getProgress(r.valorAtual, r.valorObjetivo);
                    const isCompleted = progress >= 100;
                    
                    return (
                        <tr key={r.id} className={`reserva-item ${isCompleted ? 'reserva-concluida' : ''}`}>
                            <td>
                                <strong>{r.objetivo}</strong>
                                <span className="fonte-subtext">{r.descricao}</span>
                            </td>
                            <td className="valor-col">
                                {formatValue(r.valorAtual)} /
                                <span className="fonte-subtext">{formatValue(r.valorObjetivo)}</span>
                            </td>
                            <td className="progresso-col">
                                <div className="progress-bar-container">
                                    <div 
                                        className={`progress-bar ${isCompleted ? 'completed-bar' : ''}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">{progress.toFixed(0)}% {isCompleted && <FiCheckCircle size={12} className="check-icon" />}</span>
                            </td>
                            <td>
                                <span className={`priority-tag ${getPriorityClass(r.prioridade)}`}>{r.prioridade}</span>
                                <span className="fonte-subtext">Limite: {moment(r.dataLimite).format("DD/MM/YYYY")}</span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Reserva: ${r.objetivo}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteReserva(r.id)} 
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