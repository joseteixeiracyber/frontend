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

      // Busca dados diretamente das suas rotas configuradas
      const [resReceitas, resDespesas] = await Promise.all([
        api.get(`/receitas/${userId}`, config),
        api.get(`/despesas/${userId}`, config)
      ]);

      const receitasRaw = resReceitas.data || [];
      const despesasRaw = resDespesas.data || [];

      // --- NORMALIZAÇÃO PARA A TRANSACTIONS TABLE ---
      // Aqui garantimos que os nomes das propriedades batam com o que o componente lê
      
      const receitasNormalizadas = receitasRaw.map(r => ({
        id: r.id || r._id,
        data: r.data,
        descricao: r.fonte || r.descricao || "Receita", // Mapeia 'fonte' para 'descricao'
        categoria: r.tipo || "Entrada",
        valor: parseFloat(r.valor) || 0, // Garante que seja número para evitar NaN
        type: 'credit'
      }));

      const despesasNormalizadas = despesasRaw.map(d => ({
        id: d.id || d._id,
        data: d.data,
        descricao: d.descricao || d.fonte || "Despesa",
        categoria: d.categoria || d.tipo || "Saída",
        valor: parseFloat(d.valor) || 0,
        type: 'debit'
      }));

      // Unificar e ordenar por data decrescente
      const allTransactions = [...receitasNormalizadas, ...despesasNormalizadas].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );

      setTransactions(allTransactions);

      // --- CÁLCULO DO RESUMO ---
      const totalRev = receitasNormalizadas.reduce((acc, r) => acc + r.valor, 0);
      const totalExp = despesasNormalizadas.reduce((acc, d) => acc + d.valor, 0);
      
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
