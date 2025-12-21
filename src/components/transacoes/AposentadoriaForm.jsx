import { useState } from "react";
// Adicionadas FiCalendar e FiTrendingUp para iconografia relevante
import { FiTrash2, FiEdit3, FiPlus, FiX, FiTrendingUp, FiCalendar, FiCheckCircle } from "react-icons/fi"; 
import moment from "moment"; 

// --- Simulação de Dados para Aposentadoria ---
const initialPlans = [
  { 
    id: 701, 
    nome: "Plano Principal (PGBL)", 
    valorAtual: 50000.00, 
    contribuicaoMensal: 1000.00,
    rentabilidadeEsperada: 8.0, // Anual (%)
    idadeAlvo: 65, 
    dataCriacao: moment().subtract(1, 'year').format('YYYY-MM-DD'),
    descricao: "Foco no longo prazo e benefício fiscal.",
  },
];

// --- Ordenação Inicial (por Idade Alvo, do maior para o menor) ---
const sortedInitialPlans = initialPlans.sort((a, b) => b.idadeAlvo - a.idadeAlvo);
// ----------------------------------------------------------------


// Função de Formatação de Moeda/Número (Adaptada para Projeção Sem Centavos)
const formatValue = (value, isCurrency = true, precision = 2) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return isCurrency ? 'R$ 0,00' : '0,00'; 
    
    // Se for moeda, usa precisão 2, exceto se a flag for enviada, como para a Projeção final
    const finalPrecision = isCurrency ? precision : 2; 

    if (isCurrency) {
        return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: finalPrecision, maximumFractionDigits: finalPrecision });
    }
    // Formata o número com vírgula para decimal e percentual
    return numericValue.toFixed(precision).replace('.', ',');
};

// --- FUNÇÃO CRÍTICA DE CÁLCULO DE VALOR FUTURO (FV) ---
function calculateFutureValue(pv, pmt, rateAnnual, years) {
    const rateMonthly = (rateAnnual / 100) / 12; // i
    const totalMonths = years * 12; // n

    if (years <= 0) return pv;
    
    // FV of Present Value (PV)
    const fv_pv = pv * Math.pow((1 + rateMonthly), totalMonths);
    
    // FV of Annuity (PMT - Contribuições)
    let fv_pmt;
    if (rateMonthly === 0) {
        fv_pmt = pmt * totalMonths;
    } else {
        fv_pmt = pmt * (Math.pow((1 + rateMonthly), totalMonths) - 1) / rateMonthly;
    }

    return fv_pv + fv_pmt;
}
// ----------------------------------------------------

export default function AposentadoriaForm() { 
  const [planos, setPlanos] = useState(sortedInitialPlans);
  const [showModal, setShowModal] = useState(false); 
  
  const currentAge = 35; // Idade atual fixa para o cálculo
  
  const initialFormState = {
    nome: "",
    valorAtual: "",
    contribuicaoMensal: "",
    rentabilidadeEsperada: "",
    idadeAlvo: 65,
    descricao: "",
    dataCriacao: moment().format('YYYY-MM-DD'),
  };

  const [form, setForm] = useState(initialFormState);
  
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAddPlano(e) {
    e.preventDefault();

    const valorAtualFloat = parseFloat(form.valorAtual);
    const contribuicaoMensalFloat = parseFloat(form.contribuicaoMensal);
    const rentabilidadeFloat = parseFloat(form.rentabilidadeEsperada);
    const idadeAlvoInt = parseInt(form.idadeAlvo, 10);

    if (!form.nome || isNaN(valorAtualFloat) || isNaN(contribuicaoMensalFloat) || isNaN(rentabilidadeFloat) || isNaN(idadeAlvoInt) || idadeAlvoInt <= currentAge) {
        alert("Preencha todos os campos principais com valores válidos. A Idade Alvo deve ser maior que sua idade atual.");
        return;
    }
    
    const newPlano = {
      ...form,
      id: Date.now(), 
      valorAtual: valorAtualFloat, 
      contribuicaoMensal: contribuicaoMensalFloat,
      rentabilidadeEsperada: rentabilidadeFloat,
      idadeAlvo: idadeAlvoInt,
    };

    setPlanos([...planos, newPlano].sort((a, b) => b.idadeAlvo - a.idadeAlvo));
    
    setForm(initialFormState); 
    setShowModal(false); 
  }

  const getProjection = (plano) => {
    const yearsToRetirement = plano.idadeAlvo - currentAge;
    
    if (yearsToRetirement <= 0) {
        return { value: plano.valorAtual, years: 0 };
    }

    const projectedFV = calculateFutureValue(
        plano.valorAtual,
        plano.contribuicaoMensal,
        plano.rentabilidadeEsperada,
        yearsToRetirement
    );

    return { value: projectedFV, years: yearsToRetirement };
  };
    
  // Calcula a porcentagem do valor futuro em relação ao valor investido
  const getValueGrowthPercentage = (projectionValue, initialValue, years) => {
    if (initialValue <= 0 || years <= 0) return 0;
    const growth = projectionValue - initialValue;
    return (growth / initialValue) * 100;
  };

  function handleDeletePlano(id) {
    if (window.confirm("Tem certeza que deseja deletar este plano de aposentadoria?")) {
      setPlanos(planos.filter(p => p.id !== id));
    }
  }

  // --- Renderização ---
  return (
    <div className="aposentadoria-manager">
        
      {/* 1. Toggle Bar com Botão do Modal */}
      <div className="form-toggle-bar">
          <h3 className="form-toggle-title">Projeção de Aposentadoria e Renda Futura</h3>
          <button 
              className="toggle-form-btn" 
              onClick={() => { setForm(initialFormState); setShowModal(true); }}
          >
              <FiPlus size={20} />
              Novo Plano
          </button>
      </div>

      {/* 2. Modal de Cadastro (Não alterado) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
                <h2>Projetar Novo Plano de Aposentadoria</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}><FiX size={24} /></button>
            </div>
            
            <form className="form cadastro-form" onSubmit={handleAddPlano}>
                <div className="form-grid">
                    <input name="nome" placeholder="Nome do Plano (Ex: PGBL)*" value={form.nome} onChange={handleChange} required />
                    <input name="valorAtual" type="number" step="0.01" placeholder="Valor Atual Investido (R$)*" value={form.valorAtual} onChange={handleChange} required />
                    <input name="contribuicaoMensal" type="number" step="0.01" placeholder="Contribuição Mensal (R$)*" value={form.contribuicaoMensal} onChange={handleChange} required />
                    <input name="rentabilidadeEsperada" type="number" step="0.01" placeholder="Rentabilidade Anual (%)*" value={form.rentabilidadeEsperada} onChange={handleChange} required />
                    <input name="idadeAlvo" type="number" placeholder={`Idade para Aposentar (Ex: 65)*`} value={form.idadeAlvo} onChange={handleChange} required />
                    <label className="input-placeholder">Criado em: {moment(form.dataCriacao).format('DD/MM/YYYY')}</label>
                </div>

                <textarea 
                    name="descricao" 
                    placeholder="Estratégia, tipo de investimento ou observações." 
                    value={form.descricao} 
                    onChange={handleChange}>
                </textarea>

                <div className="confirm-actions">
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                        Calcular Projeção e Salvar
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lista de Planos Existentes (AGORA NO FORMATO DE TABELA PADRÃO) */}
      <h3 className="list-title"><FiCalendar size={24} /> Planos de Aposentadoria ({planos.length})</h3>
      <p className="fonte-subtext" style={{ paddingLeft: '15px' }}>
          *Projeções baseadas na sua idade atual de **{currentAge} anos**, utilizando o cálculo de Valor Futuro (FV).
      </p>

      <div className="receitas-lista aposentadoria-lista">
        {planos.length === 0 ? (
          <p className="lista-vazia">Nenhum plano de aposentadoria cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th className="objetivo-col">Plano / Estratégia</th>
                  <th className="valor-col">Investido / Contribuição</th>
                  <th className="progresso-col">Crescimento Total</th>
                  <th className="data-col">Idade Alvo / Rentabilidade</th>
                  <th className="acoes-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {planos.map((p) => {
                    const projection = getProjection(p);
                    const yearsToRetirement = projection.years;
                    const isRetired = yearsToRetirement <= 0;
                    const growthPercentage = getValueGrowthPercentage(projection.value, p.valorAtual + (p.contribuicaoMensal * yearsToRetirement * 12), yearsToRetirement); // Crescimento sobre o valor aportado
                    
                    return (
                        <tr key={p.id} className={`aposentadoria-item ${isRetired ? 'reserva-concluida' : ''}`}>
                            <td>
                                <strong>{p.nome}</strong>
                                <span className="fonte-subtext">{p.descricao}</span>
                            </td>
                            <td className="valor-col">
                                {formatValue(p.valorAtual)} /
                                <span className="fonte-subtext">{formatValue(p.contribuicaoMensal)}/mês</span>
                            </td>
                            <td className="progresso-col">
                                <span className="valor-positivo">
                                    {formatValue(projection.value, true, 0)}
                                </span>
                                {!isRetired && (
                                    <span className="fonte-subtext">Cresc. {growthPercentage.toFixed(1).replace('.', ',')}%</span>
                                )}
                                {isRetired && (
                                    <span className="fonte-subtext completed-text">Concluído <FiCheckCircle size={12} className="check-icon" /></span>
                                )}
                            </td>
                            <td>
                                <span className="priority-tag priority-medium">Alvo: {p.idadeAlvo} anos</span>
                                <span className="fonte-subtext">Rendimento: {p.rentabilidadeEsperada.toFixed(1).replace('.', ',')}% a.a.</span>
                            </td>
                            <td className="acoes-col">
                            <button 
                                onClick={() => alert(`Editar Plano: ${p.nome}`)} 
                                className="action-btn edit-btn"
                                aria-label="Editar"
                            >
                                <FiEdit3 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeletePlano(p.id)} 
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