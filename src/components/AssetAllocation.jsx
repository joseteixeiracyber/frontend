import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#00ffd5","#ffd166","#a78bfa","#ff7aa2","#7dd3fc"];

export default function AssetAllocation({ assets = [] }) {
  const total = assets.reduce((s,a)=>s + (a.value||0), 0);
  const data = assets.map((a,i) => ({ name: a.name, value: a.value }));

  if (!assets || assets.length === 0) return <div className="card small-card"><h4>Distribuição da Carteira</h4><p className="muted">Sem ativos</p></div>

  return (
    <div className="card">
      <h4>Distribuição da Carteira</h4>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={40} outerRadius={80} paddingAngle={6}>
              {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(val) => `R$ ${val.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="alloc-list">
        {assets.map((a, idx) => (
          <div className="alloc-row" key={idx}>
            <div className="alloc-name">{a.name}</div>
            <div className="muted small">{((a.value/total)*100).toFixed(1)}%</div>
            <div className="alloc-value">R$ {a.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
