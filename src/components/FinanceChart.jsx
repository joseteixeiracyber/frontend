import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function FinanceChart({ data }) {
  // data expected: [{ date: 'Jan', revenue: 1200, expense: 400 }, ...]
  return (
    <div className="card chart-card">
      <h4>Receitas / Despesas (Últimos meses)</h4>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffd5" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#00ffd5" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7aa2" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#ff7aa2" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)"/>
            <YAxis stroke="rgba(255,255,255,0.6)"/>
            <Tooltip contentStyle={{ background: "#0b0f14", border: "none", color: "#fff" }} itemStyle={{ color: "#fff" }} />
            <Area type="monotone" dataKey="revenue" stroke="#00ffd5" fill="url(#colorRev)" />
            <Area type="monotone" dataKey="expense" stroke="#ff7aa2" fill="url(#colorExp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
