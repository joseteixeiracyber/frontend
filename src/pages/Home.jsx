import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import KPIRow from "../components/KPIRow";
import TrendChart from "../components/TrendChart";
import DonutChart from "../components/DonutChart";
import TransactionsTable from "../components/TransactionsTable";
import UpcomingPayments from "../components/UpcomingPayments";
import BudgetProgress from "../components/BudgetProgress";
import AssetAllocation from "../components/AssetAllocation";
import DebtsList from "../components/DebtsList";
import "../styles/Dashboard.css";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Dados principais
  const [accounts, setAccounts] = useState(null); // contas correntes / poupança / dinheiro
  const [transactions, setTransactions] = useState([]); // todas transações
  const [monthlySummary, setMonthlySummary] = useState(null); // receitas/despesas acumuladas
  const [budget, setBudget] = useState([]); // orçamentos por categoria
  const [assets, setAssets] = useState([]); // carteira de ativos
  const [debts, setDebts] = useState([]); // dívidas
  const [chartData, setChartData] = useState([]); // tendência 30/90 dias
  const [loading, setLoading] = useState(true);

  // --------- MOCK / FALLBACK (se a API não estiver pronta) ----------
  const fallbackAccounts = {
    checking: 5200,
    savings: 12000,
    cash: 430,
  };

  const fallbackTransactions = [
    { id: 1, date: "2025-11-28", desc: "Salário", category: "Salário", amount: 4500, type: "credit" },
    { id: 2, date: "2025-11-29", desc: "Supermercado", category: "Alimentação", amount: 320, type: "debit" },
    { id: 3, date: "2025-11-30", desc: "Uber", category: "Transporte", amount: 48, type: "debit" },
    { id: 4, date: "2025-12-02", desc: "Freelance", category: "Renda Extra", amount: 700, type: "credit" },
    { id: 5, date: "2025-12-03", desc: "Conta Luz", category: "Moradia", amount: 180, type: "debit" },
  ];

  const fallbackMonthlySummary = { revenue: 7300, expense: 2450 };
  const fallbackBudget = [
    { category: "Lazer", limit: 500, spent: 320 },
    { category: "Alimentação", limit: 1200, spent: 680 },
    { category: "Moradia", limit: 2000, spent: 1800 },
    { category: "Transporte", limit: 400, spent: 230 },
  ];
  const fallbackAssets = [
    { name: "Ações", value: 25000, type: "Stocks", returns: 0.12 },
    { name: "Tesouro", value: 15000, type: "Fixed", returns: 0.045 },
    { name: "Cripto", value: 3500, type: "Crypto", returns: -0.08 },
    { name: "Imóvel (particip.)", value: 60000, type: "RealEstate", returns: 0.05 },
  ];
  const fallbackDebts = [
    { id: "D-01", type: "Cartão", balance: 3200, rate: 0.07, termMonths: 12 },
    { id: "D-02", type: "Empréstimo Pessoal", balance: 8000, rate: 0.05, termMonths: 36 },
  ];

  const fallbackChart = [
    { date: "01/11", balance: 20000 },
    { date: "08/11", balance: 19500 },
    { date: "15/11", balance: 21000 },
    { date: "22/11", balance: 20500 },
    { date: "29/11", balance: 21800 },
    { date: "06/12", balance: 22300 },
    { date: "13/12", balance: 21700 },
    { date: "20/12", balance: 23000 },
  ];

  // --------- Carregar dados (tenta a API, caso contrário usa fallback) ----------
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      try {
        // Exemplo de chamadas: ajuste suas rotas no backend conforme necessário
        const [accRes, txRes, summaryRes, budgetRes, assetsRes, debtsRes, trendRes] = await Promise.allSettled([
          api.get("/accounts"),         // { checking, savings, cash }
          api.get("/transactions?limit=200"),
          api.get("/summary/month"),
          api.get("/budget"),
          api.get("/assets"),
          api.get("/debts"),
          api.get("/finance/trend?days=90"),
        ]);

        if (!mounted) return;

        setAccounts(accRes.status === "fulfilled" ? accRes.value.data : fallbackAccounts);
        setTransactions(txRes.status === "fulfilled" ? txRes.value.data : fallbackTransactions);
        setMonthlySummary(summaryRes.status === "fulfilled" ? summaryRes.value.data : fallbackMonthlySummary);
        setBudget(budgetRes.status === "fulfilled" ? budgetRes.value.data : fallbackBudget);
        setAssets(assetsRes.status === "fulfilled" ? assetsRes.value.data : fallbackAssets);
        setDebts(debtsRes.status === "fulfilled" ? debtsRes.value.data : fallbackDebts);
        setChartData(trendRes.status === "fulfilled" ? trendRes.value.data : fallbackChart);
      } catch (err) {
        // caso Promise.allSettled não lance erro, já temos fallbacks
        console.error("Erro ao carregar dados do dashboard", err);
        setAccounts(fallbackAccounts);
        setTransactions(fallbackTransactions);
        setMonthlySummary(fallbackMonthlySummary);
        setBudget(fallbackBudget);
        setAssets(fallbackAssets);
        setDebts(fallbackDebts);
        setChartData(fallbackChart);
      } finally {
        setLoading(false);
      }
    }

    loadAll();

    return () => { mounted = false; };
  }, []);

  // --------- CÁLCULOS DERIVADOS ----------
  const totalBalance = (() => {
    if (!accounts) return 0;
    return (accounts.checking || 0) + (accounts.savings || 0) + (accounts.cash || 0);
  })();

  const taxEconomy = (() => {
    if (!monthlySummary) return 0;
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
  window.location.href = "/login"; // garante redirecionamento imediato
};


  // --------- Render ----------
  return (
    <div className="dashboard-root">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} logout={logout} />
      <div className={`main ${collapsed ? "expanded" : ""}`}>
        <Topbar onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} theme={theme}  />

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
            <p/>
            <BudgetProgress budget={budget} />
            <p/>
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
