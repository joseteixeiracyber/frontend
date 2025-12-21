import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiBookOpen } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Educação ---
const initialEducationExpenses = [
  { 
    id: 1701, 
    tipo: "Mensalidade (Pós-Graduação)", 
    instituicao: "Universidade ABC",
    valor: 450.00, 
    data: "2025-12-05", 
    recorrencia: "Mensal", // Novo campo
    status: "Ativo", // Novo campo
    descricao: "Mensalidade de dezembro. Duração: 18 meses.",
  },
  { 
    id: 1702, 
    tipo: "Curso Livre (Online)", 
    instituicao: "Plataforma X",
    valor: 199.90, 
    data: "2025-11-20", 
    recorrencia: "Pontual", 
    status: "Concluído", 
    descricao: "Curso de Análise de Dados. Pago à vista.",
  },
];
// -------------------------

export default function EducacaoForm() { 
  const [despesas, setDespesas] = useState(initialEducationExpenses);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "",
    instituicao: "",
    valor: "",
    data: moment().format("YYYY-MM-DD"),
    recorrencia: "Mensal",
    status: "Ativo",
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  const tiposDespesa = ["Mensalidade", "Curso Livre", "Material/Livro", "Intercâmbio", "Outro"];
  const recorrenciaOptions = ["Mensal", "Anual", "Pontual"];
  const statusOptions = ["Ativo", "Concluído", "Pausado", "Cancelado"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddDespesa(e) {
    e.preventDefault();

    if (!form.tipo || !form.valor || !form.data || !form.instituicao) {
        alert("Preencha os campos obrigatórios: Tipo, Valor, Data e Instituição.");
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
    if (window.confirm("Tem certeza que deseja deletar este registro de despesa de educação?")) {
      setDespesas(despesas.filter(d => d.id !== id));
    }
  }

  // Define a classe de cor com base no status do curso
  const getStatusClass = (status) => {
      if (status === 'Concluído') return 'course-completed';
      if (status === 'Pausado') return 'course-paused';
      if (status === 'Cancelado') return 'course-cancelled';
      return 'course-active';
  };


  // --- Renderização ---
  return (
    <div className="educacao-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Despesas de Educação</h3>
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
                <h2>Registrar Despesa de Educação</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddDespesa}>
              <div className="form-grid">
                  
                  <select name="tipo" value={form.tipo} onChange={handleChange} required>
                    <option value="" disabled>Selecione o Tipo *</option>
                    {tiposDespesa.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <input name="instituicao" placeholder="Instituição/Escola *" value={form.instituicao} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor (R$)*" value={form.valor} onChange={handleChange} required />
                  <input name="data" type="date" value={form.data} onChange={handleChange} required />
                  
                  <select name="recorrencia" value={form.recorrencia} onChange={handleChange}>
                    {recorrenciaOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <select name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes do curso, nível ou matéria." 
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

      {/* 3. Lista de Despesas de Educação Existentes */}
      <h3 className="list-title"><FiBookOpen size={24} /> Despesas de Educação ({despesas.length})</h3>

      <div className="receitas-lista despesas-lista">
        {despesas.length === 0 ? (
          <p className="lista-vazia">Nenhuma despesa de educação cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Item / Instituição</th>
                  <th className="valor-col">Valor</th>
                  <th>Recorrência</th>
                  <th>Status</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((d) => (
                  <tr key={d.id} className={`educacao-item ${getStatusClass(d.status)}`}>
                    <td>
                        <strong>{d.tipo} ({d.instituicao})</strong>
                        <span className="fonte-subtext">{d.descricao}</span>
                    </td>
                    <td className="valor-col valor-negativo">
                        {d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        <span className="fonte-subtext">em {moment(d.data).format("DD/MM/YYYY")}</span>
                    </td>
                    <td>{d.recorrencia}</td>
                    <td>
                        <span className={`status-tag ${getStatusClass(d.status)}`}>
                            {d.status}
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