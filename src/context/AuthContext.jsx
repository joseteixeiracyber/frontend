import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // carregar login salvo
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // login
    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        navigate("/home");
    };

    // logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
