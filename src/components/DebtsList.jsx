export default function DebtsList({ debts = [] }) {
  if (!debts || debts.length === 0) return (
    <div className="card small-card"><h4>Dívidas</h4><p className="muted">Nenhuma dívida ativa</p></div>
  );

  const totalDebt = debts.reduce((s,d)=>s + (d.balance||0), 0);

  return (
    <div className="card small-card">
      <h4>Dívidas (Total R$ {totalDebt.toLocaleString()})</h4>
      <ul className="tx-list">
        {debts.map(d => (
          <li key={d.id}>
            <div>
              <strong>{d.type}</strong>
              <div className="muted small">Taxa { (d.rate*100).toFixed(2) }% • {d.termMonths} meses</div>
            </div>
            <div className="debit">R$ {d.balance.toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
