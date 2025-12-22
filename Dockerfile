# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache)
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Executa o build (gera a pasta /dist)
RUN npm run build

# Estágio 2: Produção (Servidor Web)
FROM nginx:stable-alpine

# Copia os arquivos do build
COPY --from=build /app/dist /usr/share/nginx/html

# COPIA A CONFIGURAÇÃO DO NGINX (Adicione esta linha!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]