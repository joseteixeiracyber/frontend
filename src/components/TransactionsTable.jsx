import { useMemo, useState } from "react";

export default function TransactionsTable({ transactions = [] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const categories = [...new Set(transactions.map(t => t.category))];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (q && !(`${t.desc} ${t.category} ${t.date}`).toLowerCase().includes(q.toLowerCase())) return false;
      if (category && t.category !== category) return false;
      if (min && Math.abs(t.amount) < Number(min)) return false;
      if (max && Math.abs(t.amount) > Number(max)) return false;
      return true;
    });
  }, [transactions, q, category, min, max]);

  return (
    <div className="card">
      <h4>Extrato Analítico</h4>

      <div className="filter-row">
        <input placeholder="Buscar (descrição, data...)" value={q} onChange={e => setQ(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="min R$" value={min} onChange={e => setMin(e.target.value)} />
        <input placeholder="max R$" value={max} onChange={e => setMax(e.target.value)} />
      </div>

      <div className="tx-table">
        <table>
          <thead>
            <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map(tx => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.desc}</td>
                <td>{tx.category}</td>
                <td className={tx.type === "credit" ? "credit" : "debit"}>
                  {tx.type === "credit" ? `+ R$ ${tx.amount}` : `- R$ ${Math.abs(tx.amount)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
