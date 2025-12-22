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

# Copia os arquivos gerados no estágio de build para o diretório do Nginx
# Nota: Se o seu projeto usa a pasta 'build' em vez de 'dist', troque abaixo
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]