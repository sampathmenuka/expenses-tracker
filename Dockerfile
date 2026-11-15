# Stage 1: build the frontend into /app/dist/public
FROM node:22-slim AS web
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY client ./client
COPY vite.config.ts tsconfig.json tsconfig.node.json components.json ./
RUN pnpm build

# Stage 2: API image that also serves the built frontend
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
# config.py resolves the UI at <repo root>/dist/public, which is /app/dist/public here.
COPY --from=web /app/dist /app/dist

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && fastapi run app/main.py --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
