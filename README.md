# OrahFinance - Personal Finance System

A comprehensive personal finance management system built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

![OrahFinance Dashboard](https://via.placeholder.com/800x400?text=OrahFinance+Dashboard)

## Features

### 📊 Expenditure Tracking
Track your expenses across multiple categories:
- **Food** - Daily meals and groceries
- **Offerings** - Honorarium, Brick Layers, Sunday/Tuesday offerings
- **Transport** - Travel and commute expenses
- **Communication** - SMS, Calls, Data bundles
- **Tithes** - Religious contributions
- **Other Giving** - Birthdays, Funerals, Lunch treats
- **Rent** - Housing expenses
- **Miscellaneous** - Other expenses

### 💰 Savings Management
Specialized savings module with three types:
- **Emergency Savings** - For unexpected expenses
- **Sinking Savings** - For planned future expenses
- **Long-term Savings** - For major life goals

Each savings goal includes:
- Name and goal amount
- Amount saved to date
- Progress tracking
- Target date

### 🌍 Multi-Currency Support
- **Default Currency**: KSH (Kenyan Shilling)
- Supports: KES, UGX, TZS, RWF, USD, EUR, GBP, NGN, ZAR, GHS
- Easy currency switching from the header
- Automatic formatting based on locale

### 📈 Dashboard & Analytics
- Weekly, monthly, and yearly expenditure summaries
- Visual charts using Recharts
- Expense vs. Savings trend analysis
- Category breakdown with donut chart

### 📥 Report Generation
- Download reports in PDF format
- Export data as CSV
- Customizable date ranges

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **Financial Calculations**: Dinero.js for precision
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "Finance system"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mywealth?schema=public"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── dashboard/     # Dashboard data endpoint
│   │   ├── expenses/      # Expense CRUD operations
│   │   ├── savings/       # Savings CRUD operations
│   │   └── reports/       # Report generation
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (Dashboard)
├── components/            # React Components
│   ├── charts/           # Chart components
│   │   ├── ExpenseChart.tsx
│   │   └── TrendChart.tsx
│   ├── dashboard/        # Dashboard components
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── QuickActions.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── StatsCards.tsx
│   └── savings/          # Savings components
│       └── SavingsProgress.tsx
├── lib/                   # Utility functions
│   ├── constants.ts      # App constants
│   ├── money.ts          # Currency utilities (Dinero.js)
│   ├── prisma.ts         # Prisma client
│   ├── reports.ts        # PDF/CSV generation
│   └── utils.ts          # General utilities
├── types/                 # TypeScript types
│   └── index.ts
prisma/
└── schema.prisma          # Database schema
```

## Database Schema

### Models

- **User** - Application users
- **Expense** - Individual expense records
- **Savings** - Savings goals
- **SavingsDeposit** - Deposits to savings goals
- **Transaction** - General transaction records
- **Budget** - Monthly budget limits

### Enums

- **ExpenseCategory** - All expense categories
- **SavingsType** - Emergency, Sinking, Long-term
- **TransactionType** - Income, Expense, Savings Deposit/Withdrawal

## API Endpoints

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Savings
- `GET /api/savings` - List savings goals
- `POST /api/savings` - Create savings goal
- `GET /api/savings/[id]` - Get savings details
- `PUT /api/savings/[id]` - Update savings
- `DELETE /api/savings/[id]` - Delete savings
- `POST /api/savings/[id]/deposit` - Add deposit

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Reports
- `GET /api/reports` - Generate report data

## Development

### Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Financial Calculations

All monetary values are stored as integers (smallest currency unit) to avoid floating-point precision issues. The `dinero.js` library is used for all calculations.

```typescript
import { createMoney, formatMoney } from '@/lib/money'

const amount = createMoney(150000) // 150,000 UGX
console.log(formatMoney(amount)) // "UGX 150,000"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js and TypeScript
