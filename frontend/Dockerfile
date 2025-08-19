# frontend/Dockerfile
FROM node

WORKDIR /app

# 先複製 package.json & package-lock.json
COPY package*.json ./
# 安裝依賴
RUN npm install --legacy-peer-deps

RUN npm install -g vite

COPY . .

CMD ["npm", "run", "dev"]
