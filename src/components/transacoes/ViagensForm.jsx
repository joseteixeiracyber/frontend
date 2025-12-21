import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiGlobe, FiMapPin } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Viagens ---
const initialTrips = [
  { 
    id: 1301, 
    destino: "Paris, França", 
    dataPartida: "2026-06-15", 
    dataRetorno: "2026-06-25",
    orcamentoTotal: 12000.00, // Meta de gasto
    valorGasto: 4500.00, // Passagens e hotel já pagos
    status: "Planejada",
    descricao: "Viagem de férias de 10 dias. Passagens aéreas reservadas.",
  },
  { 
    id: 1302, 
    destino: "Rio de Janeiro, Brasil", 
    dataPartida: "2025-12-28", 
    dataRetorno: "2026-01-05", 
    orcamentoTotal: 3000.00,
    valorGasto: 2800.00,
    status: "Em Andamento",
    descricao: "Fim de ano na praia.",
  },
];
// -------------------------

export default function ViagensForm() { 
  const [viagens, setViagens] = useState(initialTrips);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    destino: "",
    dataPartida: moment().add(3, 'months').format("YYYY-MM-DD"),
    dataRetorno: moment().add(3, 'months').add(7, 'days').format("YYYY-MM-DD"),
    orcamentoTotal: "", 
    valorGasto: 0,
    status: "Planejada",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const statusOptions = ["Planejada", "Em Andamento", "Concluída", "Cancelada"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddViagem(e) {
    e.preventDefault();

    if (!form.destino || !form.orcamentoTotal || !form.dataPartida) {
        alert("Preencha os campos obrigatórios: Destino, Orçamento Total e Data de Partida.");
        return;
    }
    
    // Lógica para cadastrar
    const newViagem = {
      ...form,
      id: Date.now(), 
      orcamentoTotal: parseFloat(form.orcamentoTotal),
      valorGasto: parseFloat(form.valorGasto) || 0,
    };

    // Adiciona e ordena pela data de partida mais próxima
    setViagens([...viagens, newViagem].sort((a, b) => new Date(a.dataPartida) - new Date(b.dataPartida)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteViagem(id) {
    if (window.confirm("Tem certeza que deseja deletar este planejamento de viagem?")) {
      setViagens(viagens.filter(v => v.id !== id));
    }
  }

  // Calcula a porcentagem do orçamento já utilizada
  const getBudgetProgress = (gasto, orcamento) => {
    if (orcamento === 0) return 0;
    return Math.min(100, (gasto / orcamento) * 100);
  };

  // Obtém a classe de cor com base no status ou no uso do orçamento
  const getTripStatusClass = (viagem, progress) => {
      if (viagem.status === 'Cancelada') return 'trip-cancelled';
      if (viagem.status === 'Concluída') return 'trip-completed';
      if (progress > 90) return 'trip-overbudget-warning'; // Quase estourando
      if (viagem.status === 'Em Andamento') return 'trip-in-progress';
      return '';
  };


  // --- Renderização ---
  return (
    <div className="viagens-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Planejamento de Viagens</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Nova Viagem
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Planejar Nova Viagem</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddViagem}>
              <div className="form-grid">
                  
                  <input name="destino" placeholder="Destino (Ex: Paris, Rio)*" value={form.destino} onChange={handleChange} required />
                  <input name="orcamentoTotal" type="number" step="0.01" placeholder="Orçamento Total Estimado (R$)*" value={form.orcamentoTotal} onChange={handleChange} required />
                  <input name="valorGasto" type="number" step="0.01" placeholder="Valor Já Gasto (Passagens, Hotel)" value={form.valorGasto} onChange={handleChange} />
                  
                  <select name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <label>Data de Partida *</label>
                  <input name="dataPartida" type="date" value={form.dataPartida} onChange={handleChange} required />
                  
                  <label>Data de Retorno</label>
                  <input name="dataRetorno" type="date" value={form.dataRetorno} onChange={handleChange} />
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes do roteiro e principais custos." 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Viagem
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Viagens Existentes */}
      <h3 className="list-title"><FiGlobe size={24} /> Planejamento de Viagens ({viagens.length})</h3>

      <div className="receitas-lista viagens-lista">
        {viagens.length === 0 ? (
          <p className="lista-vazia">Nenhuma viagem planejada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Destino / Período</th>
                  <th className="valor-col">Orçamento Estimado</th>
                  <th>Progresso (Gasto)</th>
                  <th>Status</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((v) => {
                    const progress = getBudgetProgress(v.valorGasto, v.orcamentoTotal);
                    const statusClass = getTripStatusClass(v, progress);
                    
                    return (
                        <tr key={v.id} className={`viagem-item ${statusClass}`}>
                            <td>
                                <strong><FiMapPin size={14} style={{ marginRight: '5px' }} /> {v.destino}</strong>
                                <span className="fonte-subtext">{moment(v.dataPartida).format("DD/MM/YYYY")} a {moment(v.dataRetorno).format("DD/MM/YYYY")}</span>
                            </td>
                            <td className="valor-col">
                                {v.orcamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td>
                                <div className="progress-bar-container">
                                    <div 
                                        className={`progress-bar ${statusClass}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">
                                    {v.valorGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({progress.toFixed(0)}%)
                                </span>
                            </td>
                            <td>
                                <span className={`status-tag ${statusClass}`}>{v.status}</span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Viagem: ${v.destino}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteViagem(v.id)} 
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