export default function BudgetProgress({ budget = [] }) {
  return (
    <div className="card">
      <h4>Orçamento Mensal</h4>
      {budget.length === 0 && <p className="muted">Sem orçamentos definidos</p>}
      {budget.map(b => {
        const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
        return (
          <div className="budget-row" key={b.category}>
            <div className="budget-head">
              <div>{b.category}</div>
              <div>{`R$ ${b.spent} / R$ ${b.limit}`}</div>
            </div>
            <div className="budget-bar">
              <div className="budget-progress" style={{ width: `${pct}%`, background: pct > 100 ? "#ff7aa2" : "#00ffd5" }} />
            </div>
            <div className={`muted small ${pct > 100 ? "over" : ""}`}>{pct}% usado</div>
          </div>
        );
      })}
    </div>
  );
}
