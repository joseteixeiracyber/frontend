import { useState, useMemo } from "react"; // Adicionei useMemo para otimização, mas useState (active) será removido
import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
// Importar useLocation para obter a rota atual
import { useNavigate, useLocation } from "react-router-dom"; 

export default function Sidebar({ collapsed, setCollapsed, logout }) {
  const navigate = useNavigate();
  // 1. Usar useLocation para obter a rota atual
  const location = useLocation(); 

  // Removendo o useState('dashboard'), pois a ativação será baseada na URL.
  // const [active, setActive] = useState("dashboard"); 

  const items = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/" },
    { id: "transactions", label: "Transações", icon: "💸", path: "/transacoes" },
    { id: "reports", label: "Relatórios", icon: "📈", path: "/reports" },
    { id: "settings", label: "Configurações", icon: "⚙️", path: "/settings" },
  ], []);

  // 2. Função para determinar se o item está ativo
  // Compara o caminho do item com o caminho atual
  const isActive = (itemPath) => {
    // Para o Dashboard (path: "/"), o match deve ser exato.
    if (itemPath === "/") {
      return location.pathname === itemPath;
    }
    // Para outras rotas (ex: /transacoes), verifica se a URL começa com o caminho do item.
    // Isso é útil para rotas aninhadas futuras (ex: /transacoes/detalhe/123).
    return location.pathname.startsWith(itemPath);
  };

  const handleNavigate = (item) => {
    // Não precisamos mais de setActive, apenas navegamos
    navigate(item.path);
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Branding (Mantido) */}
      <div className="brand">
        <div className="logo"></div>
        {!collapsed && <div className="brand-text">JT Finance</div>}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Navigation items (Ajustado) */}
      <nav className="nav">
        {items.map((it) => (
          <motion.div
            key={it.id}
            // 3. Usa a função isActive para determinar a classe CSS
            className={`nav-item ${isActive(it.path) ? "active" : ""}`} 
            onClick={() => handleNavigate(it)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="nav-icon">{it.icon}</div>
            {!collapsed && <div className="nav-label">{it.label}</div>}
          </motion.div>
        ))}
      </nav>

      {/* Logout button (Mantido) */}
      <motion.button
        className="logout-btn"
        onClick={logout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiLogOut size={20} />
        {!collapsed && <span>Sair</span>}
      </motion.button>

      {/* Footer (Mantido) */}
      <div className="sidebar-footer">
        {!collapsed && <small>© {new Date().getFullYear()} Artur Teixeira</small>}
      </div>
    </aside>
  );
}