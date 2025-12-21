import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiPieChart } from "react-icons/fi"; 

// --- Simulação de Dados para Distribuição de Ativos ---
const initialAllocation = [
  { 
    id: 1901, 
    categoria: "Renda Fixa", 
    porcentagemMeta: 30, // Meta
    porcentagemAtual: 35, // Real
    descricao: "Reserva de emergência e títulos de baixo risco.",
  },
  { 
    id: 1902, 
    categoria: "Ações (Brasil)", 
    porcentagemMeta: 40, 
    porcentagemAtual: 30, 
    descricao: "Foco em dividendos e crescimento.",
  },
  { 
    id: 1903, 
    categoria: "Fundos Imobiliários (FIIs)", 
    porcentagemMeta: 15, 
    porcentagemAtual: 20, 
    descricao: "Geração de renda passiva mensal.",
  },
  { 
    id: 1904, 
    categoria: "Renda Variável (Exterior)", 
    porcentagemMeta: 15, 
    porcentagemAtual: 10, 
    descricao: "ETFs e ações internacionais para dolarização.",
  },
];
// -------------------------

export default function AssetAllocationForm() { 
  const [alocacoes, setAlocacoes] = useState(initialAllocation);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    categoria: "",
    porcentagemMeta: "",
    porcentagemAtual: "",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const categorias = ["Renda Fixa", "Ações (Brasil)", "Renda Variável (Exterior)", "Fundos Imobiliários (FIIs)", "Criptomoedas", "Outros"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddAlocacao(e) {
    e.preventDefault();

    if (!form.categoria || !form.porcentagemMeta) {
        alert("Preencha os campos obrigatórios: Categoria e Porcentagem Meta.");
        return;
    }
    
    // Lógica para cadastrar
    const newAlocacao = {
      ...form,
      id: Date.now(), 
      porcentagemMeta: parseFloat(form.porcentagemMeta) || 0,
      porcentagemAtual: parseFloat(form.porcentagemAtual) || 0,
    };

    setAlocacoes([...alocacoes, newAlocacao]);
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteAlocacao(id) {
    if (window.confirm("Tem certeza que deseja deletar esta categoria da alocação?")) {
      setAlocacoes(alocacoes.filter(a => a.id !== id));
    }
  }
  
  // Calcula o desvio e retorna a classe de status
  const getDeviationStatus = (meta, atual) => {
      const deviation = Math.abs(atual - meta);
      if (deviation >= 5) return 'allocation-high-deviation'; // Alto desvio (5% ou mais)
      if (deviation >= 2) return 'allocation-medium-deviation'; // Desvio moderado (2% a 5%)
      return 'allocation-aligned'; // Alinhado
  };

  // Calcula o total
  const totalMeta = alocacoes.reduce((sum, a) => sum + a.porcentagemMeta, 0);
  const totalAtual = alocacoes.reduce((sum, a) => sum + a.porcentagemAtual, 0);


  // --- Renderização ---
  return (
    <div className="allocation-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Gerenciador de Alocação de Ativos</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Adicionar Categoria
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Definir Alocação de Ativos</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddAlocacao}>
              <div className="form-grid">
                  
                  <select name="categoria" value={form.categoria} onChange={handleChange} required>
                    <option value="" disabled>Selecione a Categoria *</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <input name="porcentagemMeta" type="number" placeholder="% Meta *" value={form.porcentagemMeta} onChange={handleChange} required />
                  <input name="porcentagemAtual" type="number" placeholder="% Atual (Opcional)" value={form.porcentagemAtual} onChange={handleChange} />
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (O que compõe esta categoria)." 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Alocação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Alocação Existente */}
      <h3 className="list-title"><FiPieChart size={24} /> Sua Carteira de Investimentos ({alocacoes.length} Ativos)</h3>
      
      {/* Visualização de gráfico (Placeholder) */}
      <div className="allocation-summary-chart">
        {/* Aqui seria renderizado um gráfico de pizza (Chart.js ou similar) */}
        <h4>Distribuição Atual vs. Meta </h4>
      </div>

      <div className="receitas-lista alocacao-lista">
        {alocacoes.length === 0 ? (
          <p className="lista-vazia">Nenhuma alocação definida.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Categoria / Descrição</th>
                  <th className="percent-col">Meta (%)</th>
                  <th className="percent-col">Atual (%)</th>
                  <th className="deviation-col">Desvio</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alocacoes.map((a) => {
                    const deviation = a.porcentagemAtual - a.porcentagemMeta;
                    const statusClass = getDeviationStatus(a.porcentagemMeta, a.porcentagemAtual);
                    
                    return (
                        <tr key={a.id} className={`allocation-item ${statusClass}`}>
                            <td>
                                <strong>{a.categoria}</strong>
                                <span className="fonte-subtext">{a.descricao}</span>
                            </td>
                            <td className="percent-col">
                                <strong>{a.porcentagemMeta.toFixed(0)}%</strong>
                            </td>
                            <td className="percent-col">
                                {a.porcentagemAtual.toFixed(0)}%
                            </td>
                            <td className="deviation-col">
                                <span className={`status-tag ${statusClass}`}>
                                    {deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`}
                                </span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Alocação: ${a.categoria}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteAlocacao(a.id)} 
                                className="action-btn delete-btn"
                                aria-label="Deletar"
                            >
                                <FiTrash2 size={16} />
                            </button>
                            </td>
                        </tr>
                    )})}
              </tbody>
              <tfoot>
                <tr>
                    <td>Total</td>
                    <td className="percent-col">{totalMeta.toFixed(0)}%</td>
                    <td className="percent-col">{totalAtual.toFixed(0)}%</td>
                    <td></td>
                    <td></td>
                </tr>
                {totalMeta !== 100 && (
                    <tr className="total-warning">
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--danger-color)' }}>
                            Atenção: A soma da Meta deve ser 100%. (Atual: {totalMeta.toFixed(0)}%)
                        </td>
                    </tr>
                )}
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}