import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function TrendChart({ data }) {
  return (
    <div className="card big-chart">
      <h4>Tendência (30/90 dias)</h4>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#00ffd5" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#00ffd5" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)"/>
            <YAxis stroke="rgba(255,255,255,0.6)"/>
            <Tooltip contentStyle={{ background: "#0b0f14", border: "none", color: "#fff" }} />
            <Area type="monotone" dataKey="balance" stroke="#00ffd5" fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
