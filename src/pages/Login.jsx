import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://apinoples.jtmoney.cloud:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || "Erro ao fazer login.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);

            navigate("/");
        } catch {
            setError("Erro ao conectar ao servidor.");
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleLogin}>
                <h2>JTMoney</h2>

                {error && <p className="error">{error}</p>}

                <input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>

                <p className="link" onClick={() => navigate("/register")}>
                    Criar uma conta
                </p>
            </form>
        </div>
    );
}
