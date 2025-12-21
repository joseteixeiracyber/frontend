import { useState } from "react";
import { FiTrash2, FiEdit3, FiPlus, FiX, FiTruck, FiTool } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Veículos ---
const initialVehicles = [
  { 
    id: 1501, 
    tipo: "Carro", 
    modelo: "Toyota Corolla 2023", 
    status: "Próprio (Quitado)", // Novo campo
    valorMercado: 120000.00, 
    despesaMensal: 350.00, // Seguro + IPVA/12
    ano: 2023, 
    descricao: "Carro principal, seguro anual pago em dez.",
  },
  { 
    id: 1502, 
    tipo: "Moto", 
    modelo: "Honda Biz 2020", 
    status: "Financiado (Parcelas)", 
    valorMercado: 10000.00,
    despesaMensal: 450.00, // Financiamento + seguro
    ano: 2020,
    descricao: "Financiamento de 36x, faltam 15 parcelas.",
  },
];
// -------------------------

export default function VeiculosForm() { 
  const [veiculos, setVeiculos] = useState(initialVehicles);
  const [showModal, setShowModal] = useState(false); 
  
  const initialFormState = {
    tipo: "Carro",
    modelo: "",
    status: "Próprio (Quitado)", 
    valorMercado: "",
    despesaMensal: "",
    ano: moment().year(),
    descricao: "",
  };

  const [form, setForm] = useState(initialFormState);
  
  const tiposVeiculo = ["Carro", "Moto", "Caminhão", "Outro"];
  const statusOptions = ["Próprio (Quitado)", "Financiado (Parcelas)", "Arrendado/Leasing"];
  
  // --- Funções de Manipulação do Formulário ---

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddVeiculo(e) {
    e.preventDefault();

    if (!form.tipo || !form.modelo || !form.valorMercado || !form.ano) {
        alert("Preencha os campos obrigatórios: Tipo, Modelo, Valor e Ano.");
        return;
    }
    
    // Lógica para cadastrar
    const newVeiculo = {
      ...form,
      id: Date.now(), 
      valorMercado: parseFloat(form.valorMercado) || 0,
      despesaMensal: parseFloat(form.despesaMensal) || 0,
      ano: parseInt(form.ano, 10),
    };

    // Adiciona e ordena por valor de mercado
    setVeiculos([...veiculos, newVeiculo].sort((a, b) => b.valorMercado - a.valorMercado));
    
    // Limpar e fechar Modal
    setForm(initialFormState); 
    setShowModal(false); 
  }

  // --- Funções de Gerenciamento ---

  function handleDeleteVeiculo(id) {
    if (window.confirm("Tem certeza que deseja deletar este registro de veículo?")) {
      setVeiculos(veiculos.filter(v => v.id !== id));
    }
  }

  // Define a classe de cor com base no status (Financiado vs Quitado)
  const getStatusClass = (status) => {
      if (status.includes("Financiado") || status.includes("Leasing")) return 'vehicle-financed';
      return 'vehicle-owned';
  };


  // --- Renderização ---
  return (
    <div className="veiculos-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Formulário de Registro de Veículos</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => setShowModal(true)} 
          >
              <FiPlus size={20} />
              Novo Veículo
          </button>
      </div>

      {/* 2. Modal de Cadastro */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Registrar Novo Veículo</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddVeiculo}>
              <div className="form-grid">
                  
                  <select name="tipo" value={form.tipo} onChange={handleChange} required>
                    {tiposVeiculo.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <input name="modelo" placeholder="Modelo (Ex: Corolla 2023)*" value={form.modelo} onChange={handleChange} required />
                  
                  <input name="valorMercado" type="number" step="0.01" placeholder="Valor de Mercado (R$)*" value={form.valorMercado} onChange={handleChange} required />
                  <input name="despesaMensal" type="number" step="0.01" placeholder="Despesa Mensal (Financ./Seguro)" value={form.despesaMensal} onChange={handleChange} />
                  
                  <input name="ano" type="number" placeholder="Ano do Modelo*" value={form.ano} onChange={handleChange} required />
                  <select name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
              </div>

              <textarea 
                  name="descricao" 
                  placeholder="Detalhes (Ex: Cor, Placa, Observações sobre Financiamento/Seguro)" 
                  value={form.descricao} 
                  onChange={handleChange}>
              </textarea>

              <button type="submit" className="btn-primary">
                Salvar Veículo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Veículos Existentes */}
      <h3 className="list-title"><FiTruck size={24} /> Gerenciamento de Veículos ({veiculos.length})</h3>

      <div className="receitas-lista veiculos-lista">
        {veiculos.length === 0 ? (
          <p className="lista-vazia">Nenhum veículo cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Modelo / Ano</th>
                  <th>Status</th>
                  <th className="valor-col">Valor de Mercado</th>
                  <th className="valor-col">Despesa Mensal</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((v) => (
                  <tr key={v.id} className={`veiculo-item ${getStatusClass(v.status)}`}>
                    <td>
                        <strong>{v.tipo}: {v.modelo} ({v.ano})</strong>
                        <span className="fonte-subtext">{v.descricao}</span>
                    </td>
                    <td>
                        <span className={`status-tag ${getStatusClass(v.status)}`}>{v.status}</span>
                    </td>
                    <td className={`valor-col valor-positivo`}>
                        {v.valorMercado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="valor-col valor-negativo">
                        <FiTool size={12} style={{ marginRight: '5px' }} />
                        {v.despesaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="acoes-col">
                      <button 
                          onClick={() => alert(`Editar Veículo: ${v.modelo}`)} 
                          className="action-btn edit-btn"
                          aria-label="Editar"
                      >
                          <FiEdit3 size={16} />
                      </button>
                      <button 
                          onClick={() => handleDeleteVeiculo(v.id)} 
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