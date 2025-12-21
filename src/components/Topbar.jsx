import { motion } from "framer-motion";

export default function Topbar({ onToggleTheme, theme }) {
  return (
    <header className="topbar">
      <div className="top-left">
        <h3 className="top-title">Painel</h3>

      </div>

      <div className="top-right">
        <motion.button
          className="theme-btn"
          onClick={onToggleTheme}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </motion.button>
      </div>
    </header>
  );
}
