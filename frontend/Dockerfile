FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src

ARG VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/leadflow-form
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_N8N_WEBHOOK_URL=${VITE_N8N_WEBHOOK_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
