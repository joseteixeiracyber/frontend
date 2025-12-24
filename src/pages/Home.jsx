import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import KPIRow from "../components/KPIRow";
import TransactionsTable from "../components/TransactionsTable";
import UpcomingPayments from "../components/UpcomingPayments";
import BudgetProgress from "../components/BudgetProgress";
import AssetAllocation from "../components/AssetAllocation";
import DebtsList from "../components/DebtsList";
import DonutChart from "../components/DonutChart";
import api, { ReceitaService, DespesaService } from "../services/api"; 
import "../styles/Dashboard.css";
import moment from "moment";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState({ revenue: 0, expense: 0 });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const loadDashboardData = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      // 1. Busca dados usando os serviços que você já validou
      const [resReceitas, resDespesas] = await Promise.all([
        api.get(`/receitas/${userId}`),
        api.get(`/despesas/${userId}`)
      ]);

      const receitasRaw = resReceitas.data || [];
      const despesasRaw = resDespesas.data || [];

      // 2. Normalização (Crucial para evitar R$ NaN e campos vazios)
      const receitasNormalizadas = receitasRaw.map(r => ({
        id: r.id || r._id,
        data: r.data,
        // Alinhado com seu backend: Receitas usam 'fonte'
        description: r.fonte || r.descricao || "Receita",
        category: r.tipo || "Entrada",
        // Converte para número garantindo que não seja NaN
        amount: parseFloat(r.valor) || 0,
        type: 'credit'
      }));

      const despesasNormalizadas = despesasRaw.map(d => ({
        id: d.id || d._id,
        data: d.data,
        // Alinhado com seu backend: Despesas usam 'categoria' ou 'fonte'
        description: d.descricao || d.tipo || "Despesa",
        category: d.categoria || "Saída",
        amount: parseFloat(d.valor) || 0,
        type: 'debit'
      }));

      // 3. Unificar para o Extrato Analítico
      const mixedTransactions = [...receitasNormalizadas, ...despesasNormalizadas]
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      setTransactions(mixedTransactions);

      // 4. Totais para os Cards (KPIs)
      const totalRev = receitasNormalizadas.reduce((acc, r) => acc + r.amount, 0);
      const totalExp = despesasNormalizadas.reduce((acc, d) => acc + d.amount, 0);
      
      setMonthlySummary({ revenue: totalRev, expense: totalExp });

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) return <div className="loading-screen">Carregando Dashboard...</div>;

  return (
    <div className="dashboard-root">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} logout={logout} />
      <div className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} theme={theme} />

        <main className="content">
          <KPIRow
            totalBalance={monthlySummary.revenue - monthlySummary.expense}
            monthlySummary={monthlySummary}
            taxEconomy={monthlySummary.revenue > 0 ? ((monthlySummary.revenue - monthlySummary.expense) / monthlySummary.revenue) * 100 : 0}
            patrimony={monthlySummary.revenue - monthlySummary.expense} 
          />

          <section className="charts-row">
            <div className="left-column">
              <UpcomingPayments transactions={transactions} /> 
              <div className="spacer" style={{ height: '20px' }} />
              <TransactionsTable transactions={transactions} />
            </div>
            <div className="right-column">
              <DonutChart transactions={transactions} /> 
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
