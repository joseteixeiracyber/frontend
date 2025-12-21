import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiHome, FiDollarSign } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Imóveis ---
const initialProperties = [
  { 
    id: 1401, 
    tipo: "Apartamento", 
    posse: "Próprio (Moradia)", // Tipo de posse
    valorMercado: 350000.00, // Valor de mercado estimado
    despesaMensal: 650.00, // Condomínio + IPTU (estimado/12)
    endereco: "Rua das Flores, 123", 
    dataAquisicao: "2023-01-01",
    descricao: "Apartamento principal, financiado. Condomínio R$ 500.",
  },
  { 
    id: 1402, 
    tipo: "Casa", 
    posse: "Aluguel (Despesa)", 
    valorMercado: 0.00, // Não é ativo
    despesaMensal: 2500.00, // Valor do Aluguel
    endereco: "Avenida Central, 456", 
    dataAquisicao: null,
    descricao: "Casa de aluguel atual. Contrato anual.",
  },
];
// -------------------------

export default function ImoveisForm() { 
  const [imoveis, setImoveis] = useState(initialProperties);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "",
    posse: "Próprio (Moradia)", 
    valorMercado: "",
    despesaMensal: "",
    endereco: "",
    dataAquisicao: moment().format("YYYY-MM-DD"),
    descricao: "",
  };

  const [form, setForm] = useState(initialFormState);
  
  const tiposPosse = ["Próprio (Moradia)", "Próprio (Investimento)", "Aluguel (Despesa)"];
  const tiposImovel = ["Apartamento", "Casa", "Terreno", "Comercial"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddImovel(e) {
    e.preventDefault();

    if (!form.tipo || !form.posse || !form.endereco) {
        alert("Preencha os campos obrigatórios: Tipo, Posse e Endereço.");
        return;
    }
    
    // Lógica para cadastrar
    const newImovel = {
      ...form,
      id: Date.now(), 
      valorMercado: parseFloat(form.valorMercado) || 0,
      despesaMensal: parseFloat(form.despesaMensal) || 0,
    };

    // Adiciona e ordena por valor de mercado
    setImoveis([...imoveis, newImovel].sort((a, b) => b.valorMercado - a.valorMercado));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteImovel(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de imóvel?")) {
      setImoveis(imoveis.filter(i => i.id !== id));
    }
  }

  // Define a classe de cor com base na posse
  const getPosseClass = (posse) => {
      if (posse.includes("Investimento")) return 'posse-investimento';
      if (posse.includes("Aluguel")) return 'posse-despesa';
      return 'posse-propria';
  };


  // --- Renderização ---
  return (
    <div className="imoveis-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Imóveis</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Novo Imóvel
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Novo Imóvel</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddImovel}>
              <div className="form-grid">
                  
                  <select name="tipo" value={form.tipo} onChange={handleChange} required>
                    <option value="" disabled>Selecione o Tipo *</option>
                    {tiposImovel.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select name="posse" value={form.posse} onChange={handleChange} required>
                    {tiposPosse.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  
                  <input name="valorMercado" type="number" step="0.01" placeholder="Valor de Mercado (R$)" value={form.valorMercado} onChange={handleChange} />
                  <input name="despesaMensal" type="number" step="0.01" placeholder="Despesa Mensal (Aluguel/Cond.)" value={form.despesaMensal} onChange={handleChange} />
                  
                  <input name="endereco" placeholder="Endereço (Cidade/Bairro)*" value={form.endereco} onChange={handleChange} required />
                  <input name="dataAquisicao" type="date" value={form.dataAquisicao} onChange={handleChange} />
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Financiamento, Tamanho, Inquilino)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Imóvel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Imóveis Existentes */}
      <h3 className="list-title"><FiHome size={24} /> Gerenciamento de Imóveis ({imoveis.length})</h3>

      <div className="imoveis-lista">
        {imoveis.length === 0 ? (
          <p className="lista-vazia">Nenhum imóvel cadastrado.</p>
        ) : (
          <div className="receitas-lista tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo / Endereço</th>
                  <th>Posse</th>
                  <th className="valor-col">Valor de Mercado</th>
                  <th className="valor-col">Despesa Mensal</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map((i) => (
                  <tr key={i.id} className={`imovel-item ${getPosseClass(i.posse)}`}>
                    <td>
                        <strong>{i.tipo}</strong>
                        <span className="fonte-subtext">{i.endereco}</span>
                    </td>
                    <td>
                        <span className={`posse-tag ${getPosseClass(i.posse)}`}>{i.posse}</span>
                    </td>
                    <td className={`valor-col ${i.valorMercado > 0 ? 'valor-positivo' : ''}`}>
                        {i.valorMercado > 0 ? i.valorMercado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}
                    </td>
                    <td className="valor-col valor-negativo">
                        <FiDollarSign size={12} style={{ marginRight: '5px' }} />
                        {i.despesaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="acoes-col">
                      <button 
                          onClick={() => alert(`Editar Imóvel: ${i.tipo}`)} 
                          className="action-btn edit-btn"
                          aria-label="Editar"
                      >
                          <FiEdit3 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDeleteImovel(i.id)} 
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