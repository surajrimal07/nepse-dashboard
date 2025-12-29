# Nepse Dashboard API Server 🚀

High-performance API server for NEPSE (Nepal Stock Exchange) data, built with Bun, Hono, and oRPC.

## ✨ Features

- **Real-time Market Data**: Scrapes and processes live market data from NEPSE.
- **OHLC Aggregator**: Fetches and stores historical OHLC data for stocks and indices.
- **Telegram Bot**: Integrated bot for market updates, stock information, and notifications.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for mobile/extension alerts.
- **Analytics**: Built-in tracking with OpenPanel.
- **Metrics**: Prometheus integration for monitoring.
- **Type-safe**: Pure TypeScript with Zod validation.
- **RPC Support**: Type-safe communication using oRPC.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/)
- **RPC**: [oRPC](https://orpc.dev/)
- **Database**: Supabase / Convex integration
- **Caching**: Redis
- **Telegram**: [grammY](https://grammy.dev/)
- **Logging**: Dedicated logger package
- **Monitoring**: Sentry & Prometheus

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- Redis server (local or cloud).
- Supabase account and project.
- Telegram Bot Token (from @BotFather).

### Installation

1. Navigate to the server directory:
   ```bash
   cd apps/server
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your credentials.

### Development

Run the server in development mode with hot reload:
```bash
bun dev
```

### Production

Build the server:
```bash
bun run build
```

Run the built server:
```bash
bun run serve
```

## 🐳 Docker Deployment

Build the image:
```bash
docker build -t nepse-dashboard-server .
```

Run with Docker Compose:
```bash
docker-compose up -d
```

## 📚 API Endpoints

The server exposes several API endpoints under `/api/v1/`:

- `GET /health`: Health check endpoint.
- `GET /metrics`: Prometheus metrics.
- `api/v1/*`: Main API routes (see `src/controllers/route.ts`).

## 🛡️ Security

- **API Key**: Production environment requires an `Authorization` header with the `API_KEY`.
- **CORS**: Configured to allow specific origins (extensions and trusted domains).
- **Rate Limiting**: Implemented to prevent abuse.

## 📄 License

This project is part of the [Nepse Dashboard](https://github.com/surajrimal07/nepse-dashboard) monorepo and is licensed under the **Source Available License**. See the root `LICENSE` for details.
