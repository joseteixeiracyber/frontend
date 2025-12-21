export default function UpcomingPayments({ transactions = [] }) {
  // considera transações do tipo 'debit' com campo dueDate (ou date); verifica próximos 7/15 dias
  const now = new Date();
  const upcoming = transactions
    .filter(t => t.type === "debit")
    .map(t => ({ ...t, due: t.dueDate ? new Date(t.dueDate) : new Date(t.date) }))
    .filter(t => {
      const diff = Math.ceil((t.due - now) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 15; // próximos 15 dias
    })
    .sort((a,b) => a.due - b.due)
    .slice(0,5);

  return (
    <div className="card small-card">
      <h4>Próximos Pagamentos (15d)</h4>
      {upcoming.length === 0 ? <p className="muted">Nenhum vencimento próximo</p> :
        <ul className="tx-list">
          {upcoming.map(u => (
            <li key={u.id}>
              <div>
                <strong>{u.desc}</strong>
                <div className="muted small">{u.category} • {u.due.toLocaleDateString()}</div>
              </div>
              <div className="debit">-R$ {Math.abs(u.amount)}</div>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
