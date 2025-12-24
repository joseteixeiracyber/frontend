import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import KPIRow from "../components/KPIRow";
import TransactionsTable from "../components/TransactionsTable";
import UpcomingPayments from "../components/UpcomingPayments";
import DonutChart from "../components/DonutChart";
import api from "../services/api"; 
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
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    window.location.href = "/login";
    return;
  }

  setLoading(true);
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [resReceitas, resDespesas] = await Promise.all([
      api.get(`/receitas/${userId}`, config),
      api.get(`/despesas/${userId}`, config)
    ]);

    // LOG PARA DEPURAÇÃO: Veja no console do Chrome se os dados estão chegando
    console.log("Receitas do BD:", resReceitas.data);
    console.log("Despesas do BD:", resDespesas.data);

    // Normalização das Receitas
    const receitasNormalizadas = (resReceitas.data || []).map(r => ({
      id: r.id || r._id,
      data: r.data,
      descricao: r.fonte || r.descricao || "Receita", 
      categoria: r.tipo || "Entrada",
      valor: Number(r.valor) || 0, // Number() é mais seguro que parseFloat para strings limpas
      type: 'credit'
    }));

    // Normalização das Despesas
    const despesasNormalizadas = (resDespesas.data || []).map(d => ({
      id: d.id || d._id,
      data: d.data,
      descricao: d.descricao || d.fonte || "Despesa",
      categoria: d.categoria || d.tipo || "Saída",
      valor: Number(d.valor) || 0,
      type: 'debit'
    }));

    const allTransactions = [...receitasNormalizadas, ...despesasNormalizadas].sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    );

    setTransactions(allTransactions);

    const totalRev = receitasNormalizadas.reduce((acc, r) => acc + r.valor, 0);
    const totalExp = despesasNormalizadas.reduce((acc, d) => acc + d.valor, 0);
    
    setMonthlySummary({ revenue: totalRev, expense: totalExp });

  } catch (err) {
    console.error("Erro crítico no carregamento:", err);
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
              {/* Agora passa a lista normalizada e corrigida */}
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
