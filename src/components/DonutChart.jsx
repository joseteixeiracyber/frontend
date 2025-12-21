import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00ffd5","#4ee0a8","#ffd166","#ff7aa2","#a78bfa","#7dd3fc"];

export default function DonutChart({ transactions = [] }) {
  // Agrupa por categoria (despesas)
  const categories = transactions.reduce((acc, t) => {
    if (t.type === "debit") {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const data = Object.keys(categories).map((k) => ({ name: k, value: categories[k] }));

  if (data.length === 0) return (
    <div className="card small-card">
      <h4>Despesas por Categoria</h4>
      <p className="muted">Sem dados</p>
    </div>
  );

  return (
    <div className="card small-card">
      <h4>Despesas por Categoria</h4>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
              {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
