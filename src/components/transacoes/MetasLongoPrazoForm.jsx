import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiTarget, FiTrendingUp } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Metas ---
const initialGoals = [
  { 
    id: 1801, 
    objetivo: "Troca de Carro (Upgrade)", 
    valorNecessario: 80000.00, 
    valorAtual: 25000.00, // Valor já acumulado
    prazo: "2028-06-01", 
    status: "Em Progresso", 
    descricao: "Guardar 80k para trocar o carro por um modelo superior.",
  },
  { 
    id: 1802, 
    objetivo: "Entrada Imóvel", 
    valorNecessario: 50000.00, 
    valorAtual: 45000.00, 
    prazo: "2026-10-01", 
    status: "Quase Lá", 
    descricao: "Juntar o valor de entrada para o financiamento.",
  },
  { 
    id: 1803, 
    objetivo: "Viagem de 1 Ano (Sabático)", 
    valorNecessario: 150000.00, 
    valorAtual: 1000.00, 
    prazo: "2030-01-01", 
    status: "Recém Iniciada", 
    descricao: "Meta ambiciosa para um ano de viagem.",
  },
];
// -------------------------

export default function MetasLongoPrazoForm() { 
  const [metas, setMetas] = useState(initialGoals);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    objetivo: "",
    valorNecessario: "",
    valorAtual: 0, 
    prazo: moment().add(3, 'years').format("YYYY-MM-DD"),
    status: "Em Progresso",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const statusOptions = ["Recém Iniciada", "Em Progresso", "Quase Lá", "Concluída", "Atrasada"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddMeta(e) {
    e.preventDefault();

    if (!form.objetivo || !form.valorNecessario || !form.prazo) {
        alert("Preencha os campos obrigatórios: Objetivo, Valor Necessário e Prazo.");
        return;
    }
    
    // Lógica para cadastrar
    const newMeta = {
      ...form,
      id: Date.now(), 
      valorNecessario: parseFloat(form.valorNecessario) || 0,
      valorAtual: parseFloat(form.valorAtual) || 0,
    };

    // Adiciona e ordena pelo prazo mais próximo
    setMetas([...metas, newMeta].sort((a, b) => new Date(a.prazo) - new Date(b.prazo)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteMeta(id) {
    if (window.confirm("Tem certeza que deseja deletar esta meta?")) {
      setMetas(metas.filter(m => m.id !== id));
    }
  }

  // Calcula a porcentagem do progresso
  const getProgress = (atual, necessario) => {
    if (necessario === 0) return 0;
    return Math.min(100, (atual / necessario) * 100);
  };

  // Obtém a classe de cor com base no status/progresso
  const getGoalStatusClass = (meta, progress) => {
      if (meta.status === 'Concluída') return 'goal-completed';
      if (moment(meta.prazo).isBefore(moment()) && progress < 100) return 'goal-overdue'; // Passou do prazo e não atingiu
      if (progress >= 90) return 'goal-almost';
      return 'goal-progress';
  };


  // --- Renderização ---
  return (
    <div className="metas-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Metas de Longo Prazo</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Nova Meta
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Definir Nova Meta</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddMeta}>
              <div className="form-grid">
                  
                  <input name="objetivo" placeholder="Objetivo (Ex: Casa na Praia)*" value={form.objetivo} onChange={handleChange} required />
                  <input name="valorNecessario" type="number" step="0.01" placeholder="Valor Total Necessário (R$)*" value={form.valorNecessario} onChange={handleChange} required />
                  <input name="valorAtual" type="number" step="0.01" placeholder="Valor Já Acumulado (R$)" value={form.valorAtual} onChange={handleChange} />
                  
                  <label>Prazo Final *</label>
                  <input name="prazo" type="date" value={form.prazo} onChange={handleChange} required />
                  
                  <select name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Onde o dinheiro está sendo investido, sub-metas)." 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Meta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Metas Existentes */}
      <h3 className="list-title"><FiTarget size={24} /> Metas de Longo Prazo ({metas.length})</h3>

      <div className="receitas-lista metas-lista">
        {metas.length === 0 ? (
          <p className="lista-vazia">Nenhuma meta de longo prazo cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Objetivo / Prazo</th>
                  <th className="valor-col">Valor Necessário</th>
                  <th>Progresso (Acumulado)</th>
                  <th>Status</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {metas.map((m) => {
                    const progress = getProgress(m.valorAtual, m.valorNecessario);
                    const statusClass = getGoalStatusClass(m, progress);
                    
                    return (
                        <tr key={m.id} className={`meta-item ${statusClass}`}>
                            <td>
                                <strong>{m.objetivo}</strong>
                                <span className="fonte-subtext">Prazo: {moment(m.prazo).format("DD/MM/YYYY")}</span>
                            </td>
                            <td className="valor-col">
                                {m.valorNecessario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td>
                                <div className="progress-bar-container">
                                    <div 
                                        className={`progress-bar ${statusClass}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">
                                    {m.valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({progress.toFixed(1)}%)
                                </span>
                            </td>
                            <td>
                                <span className={`status-tag ${statusClass}`}>
                                    <FiTrendingUp size={12} style={{ marginRight: '5px' }} />
                                    {m.status}
                                </span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Meta: ${m.objetivo}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteMeta(m.id)} 
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