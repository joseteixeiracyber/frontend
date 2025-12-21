import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiRefreshCcw } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Assinaturas ---
const initialSubscriptions = [
  { 
    id: 501, 
    nome: "Netflix Premium", 
    valor: 55.90, 
    frequencia: "Mensal", 
    proximaRenovacao: "2026-01-15", 
    categoria: "Streaming", 
    descricao: "Plano 4K com telas ilimitadas.",
  },
  { 
    id: 502, 
    nome: "Academia Local", 
    valor: 120.00, 
    frequencia: "Mensal",
    proximaRenovacao: moment().add(3, 'days').format("YYYY-MM-DD"), // Ajustado para testar o alerta (Warning)
    categoria: "Saúde", 
    descricao: "Plano sem fidelidade.",
  },
  { 
    id: 503, 
    nome: "Software X", 
    valor: 250.00, 
    frequencia: "Anual",
    proximaRenovacao: "2026-06-01", 
    categoria: "Produtividade", 
    descricao: "Licença Pro.",
  },
];
// -------------------------

// Função de Formatação de Moeda
const formatValue = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 'R$ 0,00'; 
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function AssinaturasForm() { 
  const [assinaturas, setAssinaturas] = useState(initialSubscriptions.sort((a, b) => new Date(a.proximaRenovacao) - new Date(b.proximaRenovacao)));
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    nome: "",
    valor: "",
    frequencia: "Mensal", // Padrão
    proximaRenovacao: moment().add(1, 'month').format("YYYY-MM-DD"), // Próximo mês como padrão
    categoria: "",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const frequencias = ["Mensal", "Trimestral", "Semestral", "Anual"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddAssinatura(e) {
    e.preventDefault();
    
    const valorFloat = parseFloat(form.valor);

    if (!form.nome || isNaN(valorFloat) || !form.proximaRenovacao || !form.frequencia) {
        alert("Preencha os campos obrigatórios corretamente: Nome, Valor, Frequência e Próxima Renovação.");
        return;
    }
    
    // Lógica para cadastrar
    const newAssinatura = {
      ...form,
      id: Date.now(), 
      valor: valorFloat, 
    };

    // Adiciona e ordena pela data de renovação mais próxima
    setAssinaturas([...assinaturas, newAssinatura].sort((a, b) => new Date(a.proximaRenovacao) - new Date(b.proximaRenovacao)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteAssinatura(id) {
    if (window.confirm("Tem certeza que deseja deletar esta assinatura?")) {
      setAssinaturas(assinaturas.filter(s => s.id !== id));
    }
  }

  function handleEditAssinatura(assinatura) {
      // Implementar a lógica para carregar o formulário para edição aqui.
      alert(`Função de Edição: Preparando para editar assinatura ID: ${assinatura.id}`);
  }
  
  // Calcula quantos dias faltam para a renovação
  const getDaysUntilRenewal = (dateString) => {
    const today = moment().startOf('day');
    const renewalDate = moment(dateString).startOf('day');
    return renewalDate.diff(today, 'days');
  };

  // --- Renderização ---
  return (
    <div className="assinaturas-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Gerenciamento de Assinaturas e Recorrências</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => { setForm(initialFormState); setShowModal(true); }} 
          >
              <FiPlus size={20} />
              Nova Assinatura
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Cadastrar Nova Assinatura</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddAssinatura}>
              <div className="form-grid">
                  
                  <input name="nome" placeholder="Nome da Assinatura (Ex: Spotify)*" value={form.nome} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor (R$)*" value={form.valor} onChange={handleChange} required />
                  
                  {/* Frequência */}
                  <select name="frequencia" value={form.frequencia} onChange={handleChange} required>
                    <option value="" disabled>Selecione a Frequência*</option>
                    {frequencias.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {/* Próxima Renovação */}
                  <label>Próxima Renovação *</label>
                  <input name="proximaRenovacao" type="date" value={form.proximaRenovacao} onChange={handleChange} required />
                  
                  <input name="categoria" placeholder="Categoria (Ex: Streaming, App)" value={form.categoria} onChange={handleChange} />
                  {/* Campo extra para alinhamento da grid */}
                  <div className="input-placeholder"></div>
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Observações sobre a assinatura (Ex: período de teste, cancelamento)" 
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
                        Salvar Assinatura
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Assinaturas Existentes */}
      <h3 className="list-title"><FiRefreshCcw size={24} /> Assinaturas Recorrentes ({assinaturas.length})</h3>

      <div className="receitas-lista assinaturas-lista">
        {assinaturas.length === 0 ? (
          <p className="lista-vazia">Nenhuma assinatura cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="nome-col">Assinatura / Categoria</th>
                  <th className="valor-col">Valor</th>
                  <th className="frequencia-col">Frequência</th>
                  <th className="data-renovacao-col">Próxima Renovação</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assinaturas.map((s) => {
                    const daysUntilRenewal = getDaysUntilRenewal(s.proximaRenovacao);
                    // Aplica 'renewal-warning' se faltarem 7 dias ou menos (e a data não estiver no passado)
                    const renewalClass = (daysUntilRenewal >= 0 && daysUntilRenewal <= 7) ? 'renewal-warning' : '';
                    
                    let daysText;
                    if (daysUntilRenewal < 0) {
                        daysText = `Vencida há ${Math.abs(daysUntilRenewal)} dias`;
                    } else if (daysUntilRenewal === 0) {
                        daysText = `Vence hoje`;
                    } else {
                        daysText = `Faltam ${daysUntilRenewal} dias`;
                    }

                    return (
                        <tr key={s.id} className={`assinatura-item ${renewalClass}`}>
                            <td>
                                <strong>{s.nome}</strong>
                                <span className="fonte-subtext">Categoria: {s.categoria || 'N/A'}</span>
                            </td>
                            {/* Usa a função formatValue para o valor */}
                            <td className="valor-col valor-negativo">
                                {formatValue(s.valor)}
                            </td>
                            <td>{s.frequencia}</td>
                            <td>
                                {moment(s.proximaRenovacao).format("DD/MM/YYYY")}
                                <span className={`fonte-subtext days-counter ${renewalClass}`}>
                                    {daysText}
                                </span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => handleEditAssinatura(s)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteAssinatura(s.id)} 
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