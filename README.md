<div align="center">
  <img src="apps/extension/public/icon.png" alt="Nepse Dashboard Logo" width="120" height="120">

  # Nepse Dashboard

  **Your ultimate browser companion for NEPSE, TMS, MeroShare & NaasaX**

  [![License: Source Available](https://img.shields.io/badge/License-Source%20Available-red.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
  [![pnpm](https://img.shields.io/badge/pnpm-10.x-orange.svg)](https://pnpm.io/)
  [![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-blueviolet.svg)](https://turbo.build/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

  [Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)
</div>

---

## 📖 Overview

Nepse Dashboard is a comprehensive, privacy-first monorepo powering a suite of tools for Nepal Stock Exchange (NEPSE) investors. It includes a feature-rich browser extension, a serverless backend powered by Convex, a high-performance API server, a Next.js web frontend, and AI capabilities — all designed to enhance your trading experience.

> **⚠️ Disclaimer**: This project is **NOT** affiliated with, endorsed by, or connected to NEPSE, TMS, MeroShare/CDSC, or NaasaX. This is an independent, open-source tool created for personal productivity.

---

## ✨ Features

### 📊 Live Market Data
- Real-time NEPSE index charts with replay mode
- Live market depth (buy/sell orders)
- Supply & demand analytics
- Top gainers, losers & most active stocks
- Live turnover & volume tracking
- Market sentiment indicators
- Sector-wise indices & high-cap stocks
- Company details & stock information

### 🔐 Smart Login Automation
- **TMS Portals**: Auto-CAPTCHA solving + credential autofill + form submission
- **MeroShare**: Intelligent credential autofill with auto-login
- **NaasaX**: Full login automation support
- Auto-save credentials on manual login (optional)
- Smart retry with backoff on failures

### 👥 Multi-Account Management
- Manage multiple TMS, MeroShare & NaasaX accounts
- Set primary account per broker
- Instant account switching
- Secure backup & restore configurations
- One-click manual login for any account

### 📈 Trading Tools
- Odd-lot order management
- Upcoming IPO & issue tracker
- Company disclosures & exchange messages
- Real-time notifications
- Portfolio tracking (coming soon)

### 🤖 AI-Powered Features
- **NEPSE AI Chat** — Ask about market status, get AI-powered insights
- **BYOK (Bring Your Own Key)** — Use your own API keys for AI providers
- In-browser web content extraction for AI context
- Screenshot capture for AI analysis
- Community chat integration

### ⚡ Premium Experience
- Clean sidepanel & popup modes
- Full keyboard shortcuts support
- Dark/light theme toggle
- Blazing fast React-powered UI
- Smooth animations & fluid interactions
- Push notifications for important updates

### 🛡️ Privacy First
- **100% local storage** — Credentials never leave your device
- **No external data transmission** — Your data stays with you
- **Open-source** — Fully transparent code
- **Optional analytics** — Anonymous usage only
- **Zero tracking** — No personal data collection

---

## 🏗️ Architecture

This is a **Turborepo-powered monorepo** with the following structure:

```
nepse-dashboard/
├── apps/
│   ├── extension/          # Browser extension (Chrome/Firefox) - WXT + React
│   ├── frontend/           # Web frontend - Next.js 16
│   └── server/             # API server - Hono + Bun
├── packages/
│   ├── ai/                 # AI integrations (OpenAI, Anthropic, Google, etc.)
│   ├── backend/            # Convex serverless backend
│   ├── emails/             # React Email templates
│   ├── logger/             # Shared logging utilities
│   ├── ui/                 # Shared UI component library (Radix + shadcn/ui)
│   ├── zod/                # Shared Zod schemas & validation
│   └── tsconfig/           # Shared TypeScript configurations
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── biome.jsonc             # Biome linter/formatter configuration
```

---

## 📦 Apps

### 🧩 Browser Extension (`apps/extension`)

A feature-rich browser extension built with:

| Technology | Purpose |
|------------|---------|
| [WXT](https://wxt.dev/) | Cross-browser extension framework |
| [React 19](https://react.dev/) | UI framework with React Compiler |
| [TanStack Router](https://tanstack.com/router) | Type-safe routing |
| [TanStack Query](https://tanstack.com/query) | Data fetching & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible components |
| [Convex](https://convex.dev/) | Real-time backend integration |

**Key Features:**
- Multiple entrypoints: popup, sidepanel, options, content scripts
- Content scripts for TMS, MeroShare, NaasaX, and news sites
- Background service worker for automation
- Cross-browser support (Chrome, Firefox)

### 🌐 Web Frontend (`apps/frontend`)

A modern web application built with:

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with Turbopack |
| [React 19](https://react.dev/) | UI framework |
| [Vercel AI SDK](https://sdk.vercel.ai/) | AI/LLM integration |
| [Convex](https://convex.dev/) | Real-time backend |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

**Key Features:**
- AI-powered chat interface
- Community features
- Privacy policy & terms of service pages
- Changelog & documentation

### 🚀 API Server (`apps/server`)

A high-performance API server built with:

| Technology | Purpose |
|------------|---------|
| [Bun](https://bun.sh/) | JavaScript runtime |
| [Hono](https://hono.dev/) | Web framework |
| [oRPC](https://orpc.dev/) | Type-safe RPC |
| [Grammy](https://grammy.dev/) | Telegram bot framework |
| [Redis](https://redis.io/) | Caching |
| [Cheerio](https://cheerio.js.org/) | Web scraping |
| [Prometheus](https://prometheus.io/) | Metrics |

**Key Features:**
- NEPSE data scraping & processing
- Market data APIs
- News feed aggregation
- Telegram bot for notifications
- Firebase push notifications
- Docker support for deployment

---

## 📦 Packages

### 🤖 AI Package (`packages/ai`)

Multi-provider AI integration supporting:
- OpenAI, Anthropic, Google Gemini
- DeepSeek, Mistral, Fireworks
- Perplexity, xAI (Grok)
- OpenRouter (unified access)

### ⚡ Convex Backend (`packages/backend`)

Serverless backend with:
- Real-time data synchronization
- User authentication (Better Auth)
- Rate limiting & action retriers
- Schema migrations
- Cron jobs for scheduled tasks
- Web push notifications
- Email sending (Resend)

### 📧 Emails (`packages/emails`)

React Email templates for:
- User notifications
- Transactional emails
- Marketing communications

### 🎨 UI Library (`packages/ui`)

Comprehensive component library featuring:
- 25+ Radix UI primitives
- shadcn/ui styled components
- Recharts for data visualization
- Embla Carousel
- React Flow diagrams
- Vaul drawer components

### 📋 Zod Schemas (`packages/zod`)

Shared validation schemas for:
- API request/response validation
- Form validation
- Type-safe data parsing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 10.x or higher
- **Bun** (for server development)
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/surajrimal07/nepse-dashboard.git
   cd nepse-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp apps/extension/.env.example apps/extension/.env
   cp apps/server/.env.example apps/server/.env
   cp packages/backend/.env.example packages/backend/.env
   ```

4. **Set up Convex backend**
   ```bash
   pnpm dev:setup
   ```

### Development

**Run all apps in parallel:**
```bash
pnpm dev
```

**Run specific apps:**
```bash
# Extension + Convex backend
pnpm dev:extension

# Frontend only
pnpm dev:frontend

# Server only
pnpm dev:server
```

### Building

**Build all packages:**
```bash
pnpm build
```

**Build extension for distribution:**
```bash
pnpm zip          # Chrome
pnpm zip:firefox  # Firefox
```

### Docker

**Build Docker image:**
```bash
pnpm docker:build
```

**Run with Docker Compose:**
```bash
pnpm docker:dev           # Foreground
pnpm docker:dev:detached  # Background
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open popup |
| `Ctrl+Shift+S` | Open sidepanel |
| `Ctrl+Shift+O` | Open settings |

---

## 🌐 Supported Platforms

| Platform | URL Pattern |
|----------|-------------|
| TMS Portals | `*.nepsetms.com.np` |
| MeroShare | `meroshare.cdsc.com.np` |
| NaasaX | NaasaX trading platform |

---

## 🛠️ Tech Stack Summary

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 22, Bun |
| **Languages** | TypeScript |
| **Package Manager** | pnpm 10 |
| **Build System** | Turborepo, Vite, WXT |
| **Frontend** | React 19, Next.js 16, TanStack |
| **Styling** | Tailwind CSS 4, Radix UI |
| **Backend** | Convex, Hono, oRPC |
| **AI** | Vercel AI SDK, Multi-provider |
| **Database** | Convex (serverless) |
| **Caching** | Redis |
| **Email** | React Email, Resend |
| **Linting** | Biome, ESLint |
| **Deployment** | Docker, Convex Cloud |

---

## 📚 Documentation

- **Website**: [nepsedashboard.pages.dev](https://nepsedashboard.pages.dev)
- **Privacy Policy**: [nepsedashboard.pages.dev/privacy](https://nepsedashboard.pages.dev/privacy)
- **Terms of Service**: [nepsedashboard.pages.dev/terms](https://nepsedashboard.pages.dev/terms)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and formatting (`pnpm check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality

```bash
# Format code
pnpm format

# Check linting
pnpm lint

# Type check
pnpm check-types
```

---

## ❓ FAQ

**Q: Is my data secure?**
> Yes! All credentials are stored locally on your device. No data is transmitted to external servers.

**Q: Does it work on all websites?**
> No, it only works on official TMS portals, MeroShare, and NaasaX websites.

**Q: Is it free?**
> Yes, it's free for personal, non-commercial use. See the [License](#-license) for details.

**Q: How does it handle multiple accounts?**
> You can set primary accounts per broker for TMS and MeroShare, with easy switching between accounts.

**Q: The extension is not loading data, what should I do?**
> Try reloading the extension from your browser's extensions page.

---

## 📄 License

This project is licensed under a **Source Available License** — see the [LICENSE](LICENSE) file for details.

### Key Points:

- ✅ **Allowed**: Personal use, educational use, studying the code, non-commercial projects
- ❌ **Not Allowed (without permission)**: Commercial use, selling, SaaS, business use for profit
- 📧 **Commercial Licensing**: Contact [davidparkedme@gmail.com](mailto:davidparkedme@gmail.com) for commercial licensing inquiries

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/surajrimal07/nepse-dashboard?style=social)
![GitHub forks](https://img.shields.io/github/forks/surajrimal07/nepse-dashboard?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/surajrimal07/nepse-dashboard?style=social)

---

## 🙏 Acknowledgments

- [WXT](https://wxt.dev/) for the amazing browser extension framework
- [Convex](https://convex.dev/) for the serverless backend platform
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [TanStack](https://tanstack.com/) for powerful React utilities
- [Turborepo](https://turbo.build/) for the monorepo build system

---

## 📞 Contact

**Suraj Rimal**
- Email: [davidparkedme@gmail.com](mailto:davidparkedme@gmail.com)
- GitHub: [@surajrimal07](https://github.com/surajrimal07)

---

<div align="center">
  <sub>Built with ❤️ for the NEPSE community</sub>
</div>
