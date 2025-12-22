import axios from "axios";

// Instância base do Axios configurada com baseURL e Interceptors
const api = axios.create({
    baseURL: "https://apinoples.jtmoney.cloud",
});

// ===============================
// 🔐 INTERCEPTOR DE REQUEST
// ===============================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===============================
// ⛔ INTERCEPTOR DE RESPONSE
// ===============================
api.interceptors.response.use(
    (response) => response,

    (error) => {
        // Garantir que existe resposta do servidor
        if (!error.response) {
            console.error("Erro sem resposta do servidor:", error);
            return Promise.reject(error);
        }

        // TOKEN INVÁLIDO OU EXPIRADO
        if (error.response.status === 401) {
            console.warn("Token expirado ou inválido. Redirecionando...");

            // Evita múltiplos redirecionamentos
            if (window.location.pathname !== "/") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                // Redireciona para login
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);


// ===============================
// 💳 FUNÇÕES DE SERVIÇO DE CARTÃO DE CRÉDITO (AJUSTADO)
// ===============================
const CartaoService = {
    /**
     * Busca todos os cartões de crédito para um userId específico.
     * Rota esperada: GET /cartoes/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     */
    getCartoesByUserId: (userId) => {
        return api.get(`/cartoes/${userId}`);
    },

    /**
     * ✅ NOVO: Busca todos os cartões de crédito, obtendo o userId do localStorage.
     * Rota esperada: GET /cartoes/:userId
     * @returns {Promise<AxiosResponse>}
     */
    getCartoes: () => {
        const userIdFromStorage = localStorage.getItem("userId");
        if (!userIdFromStorage) {
             return Promise.reject(new Error("UserID não encontrado no localStorage para buscar cartões."));
        }
        // Reutiliza o método getCartoesByUserId com o ID do localStorage
        return CartaoService.getCartoesByUserId(userIdFromStorage);
    },

    /**
     * Cria um novo cartão de crédito.
     * Rota esperada: POST /cartoes
     * @param {object} cartaoData - Os dados do novo cartão.
     * @returns {Promise<AxiosResponse>}
     */
    createCartao: (cartaoData) => {
        // Garante que o userId está no payload, se for necessário pelo backend
        const userIdFromStorage = localStorage.getItem("userId");
        if (!userIdFromStorage) {
            return Promise.reject(new Error("UserID não encontrado para criar o cartão."));
        }
        return api.post('/cartoes', { ...cartaoData, userId: userIdFromStorage });
    },

    /**
     * Atualiza um cartão de crédito existente.
     * Rota esperada: PUT /cartoes/:id
     * @param {string} id - O ID do cartão (MongoDB _id).
     * @param {object} cartaoData - Os dados a serem atualizados.
     * @returns {Promise<AxiosResponse>}
     */
    updateCartao: (id, cartaoData) => {
        return api.put(`/cartoes/${id}`, cartaoData);
    },

    /**
     * Deleta um cartão de crédito.
     * Rota esperada: DELETE /cartoes/:id
     * @param {string} id - O ID do cartão (MongoDB _id).
     * @returns {Promise<AxiosResponse>}
     */
    deleteCartao: (id) => {
        return api.delete(`/cartoes/${id}`);
    }
};


// ===============================
// 📦 FUNÇÕES DE SERVIÇO DE RECEITA (MANTIDO)
// ===============================
const ReceitaService = {
    /**
     * Busca todas as receitas para um userId específico.
     * Rota esperada: GET /receitas/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     */
    getReceitasByUserId: (userId) => {
        return api.get(`/receitas/${userId}`);
    },
    // ... (restante das funções de ReceitaService)
    createReceita: (receitaData) => {
        return api.post('/receitas', receitaData);
    },
    updateReceita: (id, receitaData) => {
        return api.put(`/receitas/${id}`, receitaData);
    },
    deleteReceita: (id) => {
        return api.delete(`/receitas/${id}`);
    }
};


// ===============================
// 💸 FUNÇÕES DE SERVIÇO DE DESPESA (MANTIDO)
// ===============================
const DespesaService = {
    /**
     * Busca todas as despesas para um userId específico.
     * Rota esperada: GET /despesas/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     */
    getDespesasByUserId: (userId) => {
        return api.get(`/despesas/${userId}`);
    },
    // ... (restante das funções de DespesaService)
    createDespesa: (despesaData) => {
        return api.post('/despesas', despesaData);
    },
    updateDespesa: (id, despesaData) => {
        return api.put(`/despesas/${id}`, despesaData);
    },
    deleteDespesa: (id) => {
        return api.delete(`/despesas/${id}`);
    }
};

// ===============================
// 🏦 FUNÇÕES DE SERVIÇO DE EMPRÉSTIMO (MANTIDO)
// ===============================
const EmprestimoService = {
    /**
     * Busca todos os empréstimos/financiamentos para um userId específico.
     * Rota esperada: GET /emprestimos/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     */
    getEmprestimosByUserId: (userId) => {
        return api.get(`/emprestimos/${userId}`);
    },
    
    getEmprestimos: () => {
        const userIdFromStorage = localStorage.getItem("userId");
        if (!userIdFromStorage) {
             return Promise.reject(new Error("UserID não encontrado no localStorage para buscar empréstimos."));
        }
        return api.get(`/emprestimos/${userIdFromStorage}`);
    },

    /**
     * Cria um novo empréstimo/financiamento.
     * Rota esperada: POST /emprestimos
     * @param {object} emprestimoData - Os dados do novo empréstimo.
     * @returns {Promise<AxiosResponse>}
     */
    createEmprestimo: (emprestimoData) => {
        return api.post('/emprestimos', emprestimoData);
    },

    /**
     * Atualiza um empréstimo/financiamento existente.
     * Rota esperada: PUT /emprestimos/:id
     * @param {string} id - O ID do empréstimo (MongoDB _id).
     * @param {object} emprestimoData - Os dados a serem atualizados.
     * @returns {Promise<AxiosResponse>}
     */
    updateEmprestimo: (id, emprestimoData) => {
        return api.put(`/emprestimos/${id}`, emprestimoData);
    },

    /**
     * Deleta um empréstimo/financiamento.
     * Rota esperada: DELETE /emprestimos/:id
     * @param {string} id - O ID do empréstimo (MongoDB _id).
     * @returns {Promise<AxiosResponse>}
     */
    deleteEmprestimo: (id) => {
        return api.delete(`/emprestimos/${id}`);
    }
};


// ===============================
// 📈 FUNÇÕES DE SERVIÇO DE INVESTIMENTO (MANTIDO)
// ===============================
const InvestimentoService = {
    /**
     * Busca todos os investimentos para um userId específico.
     * Rota esperada: GET /investimentos/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     * */
    getInvestimentosByUserId: (userId) => {
        return api.get(`/investimentos/${userId}`);
    },
    // ... (restante das funções de InvestimentoService)
    createInvestimento: (investimentoData) => {
        return api.post('/investimentos', investimentoData);
    },
    updateInvestimento: (id, investimentoData) => {
        return api.put(`/investimentos/${id}`, investimentoData);
    },
    deleteInvestimento: (id) => {
        return api.delete(`/investimentos/${id}`);
    }
};

// ===============================
// 🏷️ FUNÇÕES DE SERVIÇO DE CATEGORIA (MANTIDO)
// ===============================
const CategoriaService = {
    /**
     * Busca todas as categorias (incluindo as padrões e as do usuário).
     * Rota esperada: GET /categorias/:userId
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<AxiosResponse>}
     */
    getCategoriasByUserId: (userId) => {
        return api.get(`/categorias/${userId}`);
    },
    // ... (restante das funções de CategoriaService)
    createCategoria: (categoriaData) => {
        return api.post('/categorias', categoriaData);
    },
    updateCategoria: (id, categoriaData) => {
        return api.put(`/categorias/${id}`, categoriaData);
    },
    deleteCategoria: (id) => {
        return api.delete(`/categorias/${id}`);
    }
};


// Exportamos todos os objetos de serviço e a instância base do api
export { 
    ReceitaService, 
    DespesaService, 
    InvestimentoService, 
    EmprestimoService, 
    CategoriaService,
    // Exportação do CartaoService
    CartaoService
};
export default api;
