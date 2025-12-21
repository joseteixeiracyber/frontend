import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Transacoes from "../pages/Transacoes";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/home"
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
        </BrowserRouter>
    );
}
