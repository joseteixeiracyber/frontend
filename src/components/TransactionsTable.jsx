import { useMemo, useState } from "react";
import moment from "moment";

export default function TransactionsTable({ transactions = [] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // Usando 'categoria' (nome que vem da Home)
  const categories = [...new Set(transactions.map(t => t.categoria))];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Ajustado para ler 'descricao', 'categoria' e 'data'
      const searchStr = `${t.descricao} ${t.categoria} ${t.data}`.toLowerCase();
      if (q && !searchStr.includes(q.toLowerCase())) return false;
      if (category && t.categoria !== category) return false;
      
      // Ajustado para ler 'valor'
      const val = Math.abs(t.valor);
      if (min && val < Number(min)) return false;
      if (max && val > Number(max)) return false;
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
        <input placeholder="min R$" type="number" value={min} onChange={e => setMin(e.target.value)} />
        <input placeholder="max R$" type="number" value={max} onChange={e => setMax(e.target.value)} />
      </div>

      <div className="tx-table">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map(tx => (
              <tr key={tx.id}>
                {/* Formatação de Data Brasileira */}
                <td>{moment(tx.data).format("DD/MM/YYYY")}</td>
                <td>{tx.descricao}</td>
                <td>{tx.categoria}</td>
                <td className={tx.type === "credit" ? "credit" : "debit"}>
                  {tx.type === "credit" ? "+ " : "- "}
                  {/* Formatação de Moeda Brasileira */}
                  {tx.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
