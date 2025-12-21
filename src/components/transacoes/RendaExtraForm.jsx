import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiActivity } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Renda Extra ---
const initialExtraIncome = [
  { 
    id: 1001, 
    tipo: "Freelance - Desenvolvimento", 
    valor: 800.00, 
    data: "2025-12-05", 
    descricao: "Projeto de landing page para Cliente Z.",
  },
  { 
    id: 1002, 
    tipo: "Venda de Itens Usados", 
    valor: 120.00, 
    data: "2025-12-01", 
    descricao: "Venda de livros e jogos antigos no Bazar.",
  },
  { 
    id: 1003, 
    tipo: "Aulas Particulares", 
    valor: 350.00, 
    data: "2025-11-28", 
    descricao: "Pagamento por 5 aulas de inglês.",
  },
];
// -------------------------

export default function RendaExtraForm() { 
  const [rendas, setRendas] = useState(initialExtraIncome);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "",
    valor: "",
    data: moment().format("YYYY-MM-DD"),
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddRenda(e) {
    e.preventDefault();

    if (!form.tipo || !form.valor || !form.data) {
        alert("Preencha os campos obrigatórios: Tipo, Valor e Data.");
        return;
    }
    
    // Lógica para cadastrar
    const newRenda = {
      ...form,
      id: Date.now(), 
      valor: parseFloat(form.valor), 
    };

    // Adiciona e ordena pela data mais recente
    setRendas([...rendas, newRenda].sort((a, b) => new Date(b.data) - new Date(a.data)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteRenda(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de Renda Extra?")) {
      setRendas(rendas.filter(r => r.id !== id));
    }
  }

  function handleEditRenda(renda) {
      alert(`Função de Edição: Preparando para editar Renda Extra ID: ${renda.id}`);
  }


  // --- Renderização ---
  return (
    <div className="renda-extra-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Renda Extra</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Nova Renda Extra
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Nova Renda Extra</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddRenda}>
              <div className="form-grid">
                  
                  <input name="tipo" placeholder="Tipo (Ex: Freelance, Venda)" value={form.tipo} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor Recebido (R$)*" value={form.valor} onChange={handleChange} required />
                  <input name="data" type="date" value={form.data} onChange={handleChange} required />

              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Cliente, Serviço)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Renda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Rendas Extras Existentes */}
      <h3 className="list-title"><FiActivity size={24} /> Rendas Extras Registradas ({rendas.length})</h3>

      <div className="receitas-lista rendas-lista">
        {rendas.length === 0 ? (
          <p className="lista-vazia">Nenhuma renda extra cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="data-col">Data</th>
                  <th>Tipo / Descrição</th>
                  <th className="valor-col">Valor</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rendas.map((r) => (
                  <tr key={r.id} className="renda-extra-item">
                    <td>{moment(r.data).format("DD/MM/YYYY")}</td>
                    <td>
                        <strong>{r.tipo}</strong>
                        <span className="fonte-subtext">{r.descricao}</span>
                    </td>
                    <td className="valor-col valor-positivo">
                        {r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="acoes-col">
                      <button 
                          onClick={() => handleEditRenda(r)} 
                          className="action-btn edit-btn"
                          aria-label="Editar"
                      >
                          <FiEdit3 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDeleteRenda(r.id)} 
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