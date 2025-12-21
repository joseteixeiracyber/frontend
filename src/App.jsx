import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Transacoes from "./pages/Transacoes";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace/>;
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 🔐 ROTA PROTEGIDA */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/transacoes"
                    element={
                        <PrivateRoute>
                            <Transacoes />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}
