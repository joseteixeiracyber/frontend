import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import KPIRow from "../components/KPIRow";
import TransactionsTable from "../components/TransactionsTable";
import UpcomingPayments from "../components/UpcomingPayments";
import BudgetProgress from "../components/BudgetProgress";
import AssetAllocation from "../components/AssetAllocation";
import DebtsList from "../components/DebtsList";
import DonutChart from "../components/DonutChart";
import api from "../services/api"; 
import "../styles/Dashboard.css";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Estados alinhados com suas rotas
  const [transactions, setTransactions] = useState([]); // Despesas + Receitas
  const [investments, setInvestments] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de cálculos (Resumo)
  const [monthlySummary, setMonthlySummary] = useState({ revenue: 0, expense: 0 });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Chamadas diretas para suas rotas existentes
        const [resReceitas, resDespesas, resInvest, resCards, resCats] = await Promise.allSettled([
          api.get(`/receitas/${userId}`, config),
          api.get(`/despesas/${userId}`, config),
          api.get(`/investimentos/${userId}`, config), // Se houver GET de investimento
          api.get(`/cartoes/${userId}`, config),
          api.get(`/categorias/${userId}`, config),
        ]);

        if (!mounted) return;

        // 2. Extração dos dados
        const receitas = resReceitas.status === "fulfilled" ? resReceitas.value.data : [];
        const despesas = resDespesas.status === "fulfilled" ? resDespesas.value.data : [];
        const investData = resInvest.status === "fulfilled" ? resInvest.value.data : [];
        const cardData = resCards.status === "fulfilled" ? resCards.value.data : [];
        const catData = resCats.status === "fulfilled" ? resCats.value.data : [];

        // 3. Unificar transações para a tabela (ordenado por data)
        const allTxs = [...receitas, ...despesas].sort((a, b) => new Date(b.data) - new Date(a.data));
        setTransactions(allTxs);

        // 4. Calcular Resumo Mensal (Soma manual das listas)
        const totalRevenue = receitas.reduce((acc, r) => acc + parseFloat(r.valor || 0), 0);
        const totalExpense = despesas.reduce((acc, d) => acc + parseFloat(d.valor || 0), 0);
        
        setMonthlySummary({ revenue: totalRevenue, expense: totalExpense });
        setInvestments(investData);
        setCards(cardData);
        setCategories(catData);

      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  // --- CÁLCULOS PARA OS COMPONENTES ---
  
  // Patrimônio = (Receitas - Despesas) + Investimentos
  const patrimony = (monthlySummary.revenue - monthlySummary.expense) + 
                    investments.reduce((acc, i) => acc + parseFloat(i.valor || 0), 0);

  const taxEconomy = monthlySummary.revenue > 0 
    ? ((monthlySummary.revenue - monthlySummary.expense) / monthlySummary.revenue) * 100 
    : 0;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  if (loading) return <div className="loading">Carregando dados financeiros...</div>;

  return (
    <div className="dashboard-root">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} logout={logout} />
      <div className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} theme={theme} />

        <main className="content">
          <KPIRow
            totalBalance={monthlySummary.revenue - monthlySummary.expense} // Saldo Líquido
            monthlySummary={monthlySummary}
            taxEconomy={taxEconomy}
            patrimony={patrimony}
          />

          <section className="charts-row">
            <div className="left-column">
              <UpcomingPayments transactions={transactions} /> 
              <div className="spacer" style={{ height: '20px' }} />
              {/* Mapeando investimentos para BudgetProgress ou similar */}
              <BudgetProgress budget={categories} /> 
              <div className="spacer" style={{ height: '20px' }} />
              <TransactionsTable transactions={transactions} />
            </div>
            <div className="right-column">
              <AssetAllocation assets={investments} /> 
              <DebtsList debts={cards} /> {/* Mostrando faturas de cartões como débitos */}
              <DonutChart transactions={transactions} /> 
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
