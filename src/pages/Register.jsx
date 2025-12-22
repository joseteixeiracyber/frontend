import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth.css";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch("https://apinoples.jtmoney.cloud/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, confirmpassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || "Erro ao registrar.");
                return;
            }

            setSuccess("Conta criada com sucesso!");
            setTimeout(() => navigate("/login"), 1500);

        } catch {
            setError("Erro ao conectar ao servidor.");
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleRegister}>
                <h2>Criar Conta</h2>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmpassword}
                    onChange={(e) => setConfirmpassword(e.target.value)}
                />

                <button type="submit">Registrar</button>

                <p className="link" onClick={() => navigate("/login")}>
                    Já tenho conta
                </p>
            </form>
        </div>
    );
}
