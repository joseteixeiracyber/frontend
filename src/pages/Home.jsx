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
import api from "../services/api"; // Certifique-se de ter esse arquivo configurado
import "../styles/Dashboard.css";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Estados iniciais vazios para receber do Back-end
  const [accounts, setAccounts] = useState({ checking: 0, savings: 0, cash: 0 });
  const [transactions, setTransactions] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({ revenue: 0, expense: 0 });
  const [budget, setBudget] = useState([]);
  const [assets, setAssets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Se não houver token, redireciona para login
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        // Configuramos o Header de Autorização para as chamadas
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Chamadas reais para o seu Back-end Node.js
        const [accRes, txRes, summaryRes, budgetRes, assetsRes, debtsRes] = await Promise.allSettled([
          api.get("/accounts", config),
          api.get("/transactions?limit=200", config),
          api.get("/summary/month", config),
          api.get("/budget", config),
          api.get("/assets", config),
          api.get("/debts", config),
        ]);

        if (!mounted) return;

        // Atribuição dinâmica: Se a API falhar, mantém os valores zerados em vez de crashar
        if (accRes.status === "fulfilled") setAccounts(accRes.value.data);
        if (txRes.status === "fulfilled") setTransactions(txRes.value.data);
        if (summaryRes.status === "fulfilled") setMonthlySummary(summaryRes.value.data);
        if (budgetRes.status === "fulfilled") setBudget(budgetRes.value.data);
        if (assetsRes.status === "fulfilled") setAssets(assetsRes.value.data);
        if (debtsRes.status === "fulfilled") setDebts(debtsRes.value.data);

      } catch (err) {
        console.error("Erro crítico ao carregar dados", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  // --- CÁLCULOS DERIVADOS (Baseados nos dados reais do Back-end) ---
  const totalBalance = (accounts.checking || 0) + (accounts.savings || 0) + (accounts.cash || 0);

  const taxEconomy = (() => {
    const { revenue = 0, expense = 0 } = monthlySummary;
    if (revenue === 0) return 0;
    return ((revenue - expense) / revenue) * 100;
  })();

  const patrimony = (() => {
    const assetsTotal = assets?.reduce((s, a) => s + (a.value || 0), 0) || 0;
    const debtsTotal = debts?.reduce((s, d) => s + (d.balance || 0), 0) || 0;
    return assetsTotal - debtsTotal;
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  if (loading) {
    return <div className="loading-screen">Carregando Dashboard...</div>;
  }

  return (
    <div className="dashboard-root">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} logout={logout} />
      <div className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} theme={theme} />

        <main className="content">
          <KPIRow
            totalBalance={totalBalance}
            monthlySummary={monthlySummary}
            taxEconomy={taxEconomy}
            patrimony={patrimony}
          />

          <section className="charts-row">
            <div className="left-column">
              <UpcomingPayments transactions={transactions} /> 
              <div className="spacer" />
              <BudgetProgress budget={budget} />
              <div className="spacer" />
              <TransactionsTable transactions={transactions} />
            </div>
            <div className="right-column">
              <AssetAllocation assets={assets} /> 
              <DebtsList debts={debts} />
              <DonutChart transactions={transactions} /> 
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
