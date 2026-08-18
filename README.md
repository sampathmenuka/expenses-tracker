# 🌿 Daily Expense Tracker

A calm, editorial, and privacy-first personal spending ledger built with **React**, **TypeScript**, and **Tailwind CSS**. Designed for quick daily logging, insightful weekly/monthly analytics, and custom category management — all stored safely and locally on your device.

---

## ✨ Features

- **⚡ Quick Daily Expense Logging**: Add items in seconds with title, custom category, date, and amount in **LKR (Rs.)**.
- **📖 Real-Time Expense Ledger**: Search transactions, filter by category, and delete items with instant UI confirmation.
- **📊 Visual Reports & Analytics**:
  - **Daily Rhythm**: Interactive bar chart comparing spend trends across the week/month.
  - **Category Share**: Interactive pie chart breaking down expenditure proportions.
  - **Key Metrics**: Period total, daily average, and highest spending categories with trend indicators.
- **🏷️ Custom Categories**: Add custom categories with tailored colors and icons.
- **📁 CSV Data Export**: Download your entire expense ledger with a single click for backups and spreadsheet analysis.
- **📱 Fully Responsive**: Fluid desktop 3-column layout, adaptive tablet views, and collapsible mobile drawer navigation.
- **🔒 100% Private & Offline**: All data stays in your browser with zero tracking and zero server storage.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern UI library with functional components & hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict static type safety throughout the codebase |
| **Build Tool** | [Vite 7](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Inline utility classes with `@theme` token configuration |
| **Typography** | [Poppins](https://fonts.google.com/specimen/Poppins) & [Fraunces](https://fonts.google.com/specimen/Fraunces) | Curated Google Fonts for modern editorial aesthetic |
| **Routing** | [Wouter](https://github.com/molefrog/wouter) | Minimalist (~1.5kB) client-side routing |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean and consistent icon set |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG-based charts (Bar, Pie, Tooltips) |
| **Toasts** | [Sonner](https://sonner.emilkowal.ski/) | Lightweight toast notifications for exports & deletions |
| **Server** | [Express](https://expressjs.com/) | Lightweight Node.js server for serving static production build |

---

## 💾 How Data is Stored (Storage Architecture)

This application uses a **Client-Side Persistence Architecture** via the browser's `localStorage` API:

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Window                        │
│                                                             │
│   React UI ──> useExpenses Hook ───┐                        │
│                                    ├──> localStorage        │
│   React UI ──> useCategories Hook ─┘    ("daily_ledger_*")  │
│                                                             │
│   [ No External Database Required - 100% Free & Offline ]   │
└─────────────────────────────────────────────────────────────┘
```

### Storage Keys
1. **`daily_ledger_expenses_v1`**: JSON array of expense objects:
   ```json
   [
     {
       "id": "exp-1723984920000-xyz",
       "title": "Lunch at the cafe",
       "amount": 1250,
       "categoryId": "food",
       "date": "2026-08-18",
       "createdAt": "2026-08-18T10:30:00.000Z"
     }
   ]
   ```
2. **`daily_ledger_categories_v1`**: JSON array of default & user-created categories:
   ```json
   [
     {
       "id": "custom-1723984920000",
       "name": "Gym & Fitness",
       "color": "#4f8b83",
       "icon": "custom",
       "isCustom": true
     }
   ]
   ```

### Why No Database is Needed:
- **Zero Cost**: No database hosting fees, connection limits, or cloud infrastructure to maintain.
- **Privacy First**: Sensitive financial data never leaves your personal browser.
- **Instant Speed**: Zero network latency for reading, adding, and filtering records.
- **Offline Capability**: Works seamlessly without an active internet connection.
- **Portability**: Data can be exported to standard `.csv` format at any time.

---

## 📁 Project Structure

```
daily-expense-tracker/
├── client/                      # Frontend SPA source code
│   ├── public/                  # Static public assets
│   │   ├── empty-sprout.svg     # Empty ledger illustration
│   │   └── logo.svg             # Application logo & favicon
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Brand, CategoryBadge, ErrorBoundary
│   │   │   ├── layout/          # Sidebar, MobileNav, ContextPanel, MonthPocket
│   │   │   ├── modals/          # CategoryDialog (modal for new categories)
│   │   │   ├── reports/         # MetricCard, ChartTooltip, EmptyReport
│   │   │   └── ui/              # Button, Card, Sonner, Tooltip primitives
│   │   ├── constants/           # Default categories, icons, and storage keys
│   │   ├── contexts/            # ThemeContext (Light / Dark mode provider)
│   │   ├── hooks/               # Custom state hooks (useExpenses, useCategories)
│   │   ├── lib/                 # Utility functions (cn class merger)
│   │   ├── pages/               # Top-level view routes
│   │   │   ├── views/           # TodayView, ExpenseLedger, ReportsView, CategoriesView
│   │   │   ├── Home.tsx         # Main dashboard container & state coordinator
│   │   │   └── NotFound.tsx     # 404 fallback page
│   │   ├── types/               # TypeScript interfaces (expense, category, navigation)
│   │   ├── utils/               # Date helpers, formatters, and CSV export logic
│   │   ├── App.tsx              # Root application component & routing
│   │   ├── index.css            # Tailwind theme tokens & base animations
│   │   └── main.tsx             # React DOM entrypoint
│   └── index.html               # Main HTML entry with Google Fonts
├── server/                      # Optional Node.js production server
│   └── index.ts                 # Express static file server for production
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite build and path alias configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [pnpm](https://pnpm.io/) or `npm` / `yarn`

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/sampathmenuka/expenses-tracker.git
cd expenses-tracker

# Install dependencies
pnpm install
# or: npm install
```

### 2. Run the Development Server
```bash
pnpm dev
# or: npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
pnpm build
# or: npm run build
```
This compiles the optimized production build into `dist/public`.

---

## 🌐 Free Deployment Guide

Because this application is a static client-side SPA, you can host it **100% for free**:

### Option 1: Vercel (Recommended)
1. Push your repository to **GitHub**.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist/public`
4. Click **Deploy**.

### Option 2: Netlify
1. Log in to [Netlify](https://netlify.com) and select **"Import from Git"**.
2. Set build command: `vite build` and publish directory: `dist/public`.
3. Click **Deploy Site**.

### Option 3: Cloudflare Pages
1. Go to [Cloudflare Pages](https://pages.cloudflare.com) and connect your repository.
2. Set framework preset to `Vite`, build output to `dist/public`, and deploy.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
