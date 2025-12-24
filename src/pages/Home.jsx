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
  const [transactions, setTransactions] = useState([]); 
  const [investments, setInvestments] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

        const [resReceitas, resDespesas, resInvest, resCards, resCats] = await Promise.allSettled([
          api.get(`/receitas/${userId}`, config),
          api.get(`/despesas/${userId}`, config),
          api.get(`/investimentos/${userId}`, config), 
          api.get(`/cartoes/${userId}`, config),
          api.get(`/categorias/${userId}`, config),
        ]);

        if (!mounted) return;

        // 1. Normalização das Receitas (type: credit)
        const receitasRaw = resReceitas.status === "fulfilled" ? resReceitas.value.data : [];
        const receitasNormalizadas = receitasRaw.map(r => ({
          ...r,
          type: 'credit',
          category: r.tipo || 'Receita',
          description: r.fonte || r.descricao || 'Entrada'
        }));

        // 2. Normalização das Despesas (type: debit)
        const despesasRaw = resDespesas.status === "fulfilled" ? resDespesas.value.data : [];
        const despesasNormalizadas = despesasRaw.map(d => ({
          ...d,
          type: 'debit',
          category: d.categoria || d.tipo || 'Geral',
          description: d.fonte || d.descricao || 'Saída'
        }));

        // 3. Unificar e Ordenar por Data (Extrato Analítico)
        const allTxs = [...receitasNormalizadas, ...despesasNormalizadas].sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );

        setTransactions(allTxs);

        // 4. Cálculos de Totais
        const totalRevenue = receitasNormalizadas.reduce((acc, r) => acc + parseFloat(r.valor || 0), 0);
        const totalExpense = despesasNormalizadas.reduce((acc, d) => acc + parseFloat(d.valor || 0), 0);
        
        setMonthlySummary({ revenue: totalRevenue, expense: totalExpense });
        setInvestments(resInvest.status === "fulfilled" ? resInvest.value.data : []);
        setCards(resCards.status === "fulfilled" ? resCards.value.data : []);
        setCategories(resCats.status === "fulfilled" ? resCats.value.data : []);

      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  const patrimony = (monthlySummary.revenue - monthlySummary.expense) + 
                    investments.reduce((acc, i) => acc + parseFloat(i.valor || 0), 0);

  const taxEconomy = monthlySummary.revenue > 0 
    ? ((monthlySummary.revenue - monthlySummary.expense) / monthlySummary.revenue) * 100 
    : 0;

  const logout = () => {
    localStorage.clear();
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
            totalBalance={monthlySummary.revenue - monthlySummary.expense}
            monthlySummary={monthlySummary}
            taxEconomy={taxEconomy}
            patrimony={patrimony}
          />

          <section className="charts-row">
            <div className="left-column">
              <UpcomingPayments transactions={transactions} /> 
              <div className="spacer" style={{ height: '20px' }} />
              <BudgetProgress budget={categories} /> 
              <div className="spacer" style={{ height: '20px' }} />
              <TransactionsTable transactions={transactions} />
            </div>
            <div className="right-column">
              <AssetAllocation assets={investments} /> 
              <DebtsList debts={cards} />
              <DonutChart transactions={transactions} /> 
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
