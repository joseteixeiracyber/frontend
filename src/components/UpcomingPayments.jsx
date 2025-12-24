import moment from "moment";

export default function UpcomingPayments({ transactions = [] }) {
  // Filtra transações que vencem nos próximos 15 dias e que são saídas (debit)
  const upcoming = transactions.filter(t => {
    const diffDays = moment(t.data).diff(moment(), 'days');
    // Considera apenas despesas (debit) que vencem entre hoje e os próximos 15 dias
    return t.type === 'debit' && diffDays >= 0 && diffDays <= 15;
  }).sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena pela data mais próxima

  return (
    <div className="card">
      <h4>Próximos Pagamentos (15d)</h4>
      {upcoming.length === 0 ? (
        <p className="no-data">Nenhum vencimento próximo</p>
      ) : (
        <ul className="upcoming-list">
          {upcoming.map(tx => (
            <li key={tx.id} className="upcoming-item">
              <div className="item-info">
                <span className="item-date">{moment(tx.data).format("DD/MM")}</span>
                <span className="item-desc">{tx.descricao}</span>
              </div>
              <span className="item-value">
                {tx.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
