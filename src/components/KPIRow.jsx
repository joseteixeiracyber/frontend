import { motion } from "framer-motion";

export default function KPIRow({ totalBalance, monthlySummary, taxEconomy, patrimony }) {
  const revenue = monthlySummary?.revenue || 0;
  const expense = monthlySummary?.expense || 0;

  return (
    <div className="kpi-row">
      <motion.div className="card kpi" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="kpi-title">Saldo Total Consolidado</div>
        <div className="kpi-value">R$ {totalBalance.toLocaleString()}</div>
        <div className="kpi-sub">Contas + Poupança + Dinheiro</div>
      </motion.div>

      <motion.div className="card kpi" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.05}}>
        <div className="kpi-title">Metas Mensais</div>
        <div className="kpi-value">Receita R$ {revenue.toLocaleString()}</div>
        <div className="kpi-sub">Despesa R$ {expense.toLocaleString()}</div>
      </motion.div>

      <motion.div className="card kpi" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}>
        <div className="kpi-title">Taxa de Economia</div>
        <div className="kpi-value">{taxEconomy.toFixed(1)}%</div>
        <div className="kpi-sub">Eficiência: (Receitas - Despesas) / Receitas</div>
      </motion.div>

      <motion.div className="card kpi" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}}>
        <div className="kpi-title">Patrimônio Líquido</div>
        <div className="kpi-value">R$ {patrimony.toLocaleString()}</div>
        <div className="kpi-sub">Ativos - Passivos</div>
      </motion.div>
    </div>
  );
}
