import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi"; 
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/transacoes.css"; 
import {
  ReceitaForm,
  DespesaForm,
  InvestimentoForm,
  CartaoCreditoForm,
  EmprestimoForm,
  AssinaturasForm,
  ReservasForm,
  AposentadoriaForm,
  ImpostosForm,
  CashbackForm,
  RendaExtraForm,
  DoacoesForm,
  SegurosForm,
  ViagensForm,
  ImoveisForm,
  VeiculosForm,
  SaudeForm,
  EducacaoForm,
  AssetAllocationForm,
  MetasLongoPrazoForm,
} from "../components/transacoes";

// Mapeamento dos IDs de abas para os componentes de formulário
const formComponents = {
  receitas: ReceitaForm,
  despesas: DespesaForm,
  investimentos: InvestimentoForm,
  cartao: CartaoCreditoForm,
  emprestimos: EmprestimoForm,
  assinaturas: AssinaturasForm,
  reservas: ReservasForm,
  aposentadoria: AposentadoriaForm,
  impostos: ImpostosForm,
  cashback: CashbackForm,
  extra: RendaExtraForm,
  doacoes: DoacoesForm,
  seguros: SegurosForm,
  viagens: ViagensForm,
  imoveis: ImoveisForm,
  veiculos: VeiculosForm,
  saude: SaudeForm,
  educacao: EducacaoForm,
  carteira: AssetAllocationForm,
  longoprazo: MetasLongoPrazoForm,
};

// ===============================================
// Lista Mestra de Todas as Categorias (Completa)
// ===============================================
const allTabs = [
  { id: "receitas", label: "Receitas" },
  { id: "despesas", label: "Despesas" },
  { id: "carteira", label: "Distribuição da Carteira" },
  { id: "investimentos", label: "Investimentos" },
  { id: "cartao", label: "Cartões de Crédito" },
  { id: "emprestimos", label: "Empréstimos" },
  { id: "assinaturas", label: "Assinaturas" },
  { id: "reservas", label: "Reservas Financeiras" },
  { id: "aposentadoria", label: "Aposentadoria" },
  { id: "impostos", label: "Impostos" },
  { id: "cashback", label: "Cashback" },
  { id: "extra", label: "Renda Extra" },
  { id: "doacoes", label: "Doações" },
  { id: "seguros", label: "Seguros" },
  { id: "viagens", label: "Viagens" },
  { id: "imoveis", label: "Imóveis" },
  { id: "veiculos", label: "Veículos" },
  { id: "saude", label: "Saúde" },
  { id: "educacao", label: "Educação" },
  { id: "longoprazo", label: "Metas Longo Prazo" },
];

// ===============================================
// Categorias Padrão que SEMPRE aparecem no menu
// ===============================================
const defaultTabs = ["receitas", "despesas", "carteira"];

export default function Transacoes() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  
  // ESTADOS NOVOS PARA GERENCIAMENTO DE TABS
  // Usamos a classe 'active' do CSS para exibir, o React garante a renderização condicional.
  const [showCategoriesModal, setShowCategoriesModal] = useState(false); 
  
  // Estado para armazenar os IDs das abas que o usuário selecionou para exibir
  const [userTabs, setUserTabs] = useState(() => {
    try {
      const storedTabs = localStorage.getItem("userFinanceTabs");
      return storedTabs ? JSON.parse(storedTabs) : defaultTabs;
    } catch (error) {
      console.error("Erro ao carregar tabs do localStorage", error);
      return defaultTabs;
    }
  });

  // Define a aba ativa. Garante que se a aba ativa não estiver mais em userTabs, ele volta para 'receitas'.
  const [tab, setTab] = useState(() => {
      const initialTab = localStorage.getItem("activeFinanceTab") || "receitas";
      if (!userTabs.includes(initialTab) && userTabs.length > 0) {
          return userTabs[0]; 
      }
      return initialTab;
  });

  // EFEITO PARA SALVAR A ABA ATIVA
  useEffect(() => {
    localStorage.setItem("activeFinanceTab", tab);
  }, [tab]);
  
  // FUNÇÃO PARA SALVAR AS PREFERÊNCIAS DO MODAL
  const handleSaveCategories = (selectedIds) => {
    // Garante que as abas padrão sempre estejam inclusas
    const finalTabs = [...new Set([...defaultTabs, ...selectedIds])]; 
    
    // 1. Salva no estado
    setUserTabs(finalTabs);
    
    // 2. Salva no LocalStorage
    localStorage.setItem("userFinanceTabs", JSON.stringify(finalTabs));
    
    // 3. Ajusta a aba ativa se necessário
    if (!finalTabs.includes(tab)) {
        setTab(finalTabs[0] || "receitas");
    }
    
    // 4. Fecha o modal
    setShowCategoriesModal(false);
  };
  
  // Essa função não é mais usada diretamente pelo menu lateral, mas mantida por consistência
  const handleToggleCategory = (id) => {
    if (defaultTabs.includes(id)) return;

    setUserTabs(prevTabs => {
      if (prevTabs.includes(id)) {
        return prevTabs.filter(tabId => tabId !== id);
      } else {
        return [...prevTabs, id];
      }
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // MEMO: FILTRA APENAS AS ABAS SELECIONADAS
  const visibleTabs = useMemo(() => {
    return allTabs.filter(t => userTabs.includes(t.id));
  }, [userTabs]);

  // Componente que será renderizado dinamicamente
  const CurrentForm = useMemo(() => formComponents[tab] || null, [tab]);
  
  // Rótulo da aba ativa para o título
  const activeTabLabel = useMemo(() => {
      return allTabs.find(t => t.id === tab)?.label || "Detalhes";
  }, [tab]);

  // ===============================================
  // 🖼️ MODAL DE CONFIGURAÇÃO DE CATEGORIAS (AJUSTADO)
  // ===============================================
  const CategoriesModal = () => {
    // Usamos um estado interno do modal para manipulação temporária
    const [tempSelectedTabs, setTempSelectedTabs] = useState(userTabs);

    const toggleTempSelection = (id) => {
        // As abas padrão não podem ser desmarcadas
        if (defaultTabs.includes(id)) return;

        setTempSelectedTabs(prev => {
            if (prev.includes(id)) {
                return prev.filter(tabId => tabId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Função auxiliar para fechar o modal
    const handleCloseModal = () => {
      // Ao fechar, se houver mudanças não salvas, o estado tempSelectedTabs será descartado
      setShowCategoriesModal(false);
    };

    return (
        // ADICIONAMOS A CLASSE 'active' AQUI PARA VISIBILIDADE NO CSS
        <div className="modal-overlay active"> 
            <div className="modal-content modal-categories">
                <div className="modal-header">
                    <h2>Categorias Visíveis</h2>
                </div>
                
                <p>Selecione as categorias que deseja exibir no menu lateral. As categorias Receitas, Despesas e Distribuição da Carteira são exibidas por padrão.</p>

                <div className="categories-grid">
                    {allTabs.map((t) => {
                        const isSelected = tempSelectedTabs.includes(t.id);
                        const isLocked = defaultTabs.includes(t.id);
                        
                        return (
                            <div 
                                key={t.id} 
                                className={`category-item ${isSelected ? 'selected' : ''} ${isLocked ? 'default-locked' : ''}`}
                                onClick={() => toggleTempSelection(t.id)}
                            >
                                {/* REMOVIDO: input[type="checkbox"] */}
                                {t.label}
                                {isLocked && <span className="default-tag">(Padrão)</span>}
                            </div>
                        )
                    })}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                    <button 
                        className="btn-primary" 
                        onClick={() => handleSaveCategories(tempSelectedTabs)}
                    >
                        Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
  };
  // -----------------------------------------------

  return (
    <div className="dashboard-root" data-theme={theme}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        logout={logout}
      />

      <div className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar
          onToggleTheme={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          theme={theme}
        />

        <main className="content transacoes-content">


          <div className="transacoes-layout">
            
            {/* 1. Lista Lateral de Opções (Menu Vertical) */}
            <nav className="transacoes-menu">
              <div className="menu-header"> 
                <h3 className="menu-titulo">Categorias</h3>
                {/* Botão + para abrir o modal */}
                <button 
                    className="add-category-btn" 
                    onClick={() => setShowCategoriesModal(true)}
                    aria-label="Adicionar/Editar Categorias"
                >
                    <FiPlus size={20} />
                </button>
              </div>
              <ul className="opcoes-lista">
                {visibleTabs.map((t) => (
                  <li key={t.id}>
                    <button
                      className={t.id === tab ? "opcao-item active" : "opcao-item"}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 2. Conteúdo Dinâmico da Categoria Selecionada */}
            <div className="transacoes-detalhes">
              <h2 className="categoria-titulo">{activeTabLabel}</h2>
              <div className="conteudo-formulario">
                {CurrentForm && <CurrentForm />}
              </div>
              
              <div className="gerenciamento-dados">
              </div>

            </div>
          </div>
        </main>
      </div>
      
      {/* 3. Renderiza o Modal de Configuração se showCategoriesModal for true */}
      {showCategoriesModal && <CategoriesModal />}
    </div>
  );
}