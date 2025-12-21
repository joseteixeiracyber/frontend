import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiHeart } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Doações ---
const initialDonations = [
  { 
    id: 1101, 
    beneficiario: "ONG Animais Felizes", 
    valor: 50.00, 
    data: "2025-12-01", 
    descricao: "Doação mensal de apoio.",
    tipo: "Recorrente"
  },
  { 
    id: 1102, 
    beneficiario: "Campanha de Natal (Vizinho)", 
    valor: 100.00, 
    data: "2025-11-20", 
    descricao: "Ajuda para compra de alimentos.",
    tipo: "Pontual"
  },
  { 
    id: 1103, 
    beneficiario: "Cruz Vermelha", 
    valor: 25.00, 
    data: "2025-12-05", 
    descricao: "Doação emergencial.",
    tipo: "Pontual"
  },
];
// -------------------------

export default function DoacoesForm() { 
  const [doacoes, setDoacoes] = useState(initialDonations);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    beneficiario: "",
    valor: "",
    data: moment().format("YYYY-MM-DD"),
    tipo: "Pontual", // Novo campo: Pontual ou Recorrente
    descricao: ""
  };

  const [form, setForm] = useState(initialFormState);
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddDoacao(e) {
    e.preventDefault();

    if (!form.beneficiario || !form.valor || !form.data) {
        alert("Preencha os campos obrigatórios: Beneficiário, Valor e Data.");
        return;
    }
    
    // Lógica para cadastrar
    const newDoacao = {
      ...form,
      id: Date.now(), 
      valor: parseFloat(form.valor), 
    };

    // Adiciona e ordena pela data mais recente
    setDoacoes([...doacoes, newDoacao].sort((a, b) => new Date(b.data) - new Date(a.data)));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteDoacao(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de doação?")) {
      setDoacoes(doacoes.filter(d => d.id !== id));
    }
  }

  function handleEditDoacao(doacao) {
      alert(`Função de Edição: Preparando para editar Doação ID: ${doacao.id}`);
  }

  // Define a cor da linha com base no tipo
  const getRowClass = (tipo) => {
      return tipo === 'Recorrente' ? 'doacao-recorrente' : 'doacao-pontual';
  };


  // --- Renderização ---
  return (
    <div className="doacoes-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Doações</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Nova Doação
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Nova Doação</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddDoacao}>
              <div className="form-grid">
                  
                  <input name="beneficiario" placeholder="Nome do Beneficiário/ONG*" value={form.beneficiario} onChange={handleChange} required />
                  <input name="valor" type="number" step="0.01" placeholder="Valor Doado (R$)*" value={form.valor} onChange={handleChange} required />
                  <input name="data" type="date" value={form.data} onChange={handleChange} required />

                  <select name="tipo" value={form.tipo} onChange={handleChange}>
                    <option value="Pontual">Pontual</option>
                    <option value="Recorrente">Recorrente</option>
                  </select>

              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Finalidade, Campanha)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Doação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Doações Existentes */}
      <h3 className="list-title"><FiHeart size={24} /> Doações Registradas ({doacoes.length})</h3>

      <div className="receitas-lista doacoes-lista">
        {doacoes.length === 0 ? (
          <p className="lista-vazia">Nenhuma doação cadastrada.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="data-col">Data</th>
                  <th>Beneficiário / Descrição</th>
                  <th>Tipo</th>
                  <th className="valor-col">Valor</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {doacoes.map((d) => (
                  <tr key={d.id} className={`doacao-item ${getRowClass(d.tipo)}`}>
                    <td>{moment(d.data).format("DD/MM/YYYY")}</td>
                    <td>
                        <strong>{d.beneficiario}</strong>
                        <span className="fonte-subtext">{d.descricao}</span>
                    </td>
                    <td>{d.tipo}</td>
                    <td className="valor-col valor-negativo">
                        {d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="acoes-col">
                      <button 
                          onClick={() => handleEditDoacao(d)} 
                          className="action-btn edit-btn"
                          aria-label="Editar"
                      >
                          <FiEdit3 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDeleteDoacao(d.id)} 
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