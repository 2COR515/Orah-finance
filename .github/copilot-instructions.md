# OrahFinance - Personal Finance System

## Project Overview
A comprehensive personal finance management system built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **Financial Calculations**: Dinero.js for precise currency handling
- **PDF Generation**: jsPDF for report downloads

## Features
- Expenditure Tracking with categories
- Savings Management (Emergency, Sinking, Long-term)
- Dashboard with analytics
- Report generation (PDF/CSV)
- Multi-currency support (KSH default)

## Development Guidelines
- Use TypeScript strict mode
- All financial calculations must use Dinero.js
- Follow mobile-first responsive design
- Use Server Components where possible
- Implement proper error handling
- Currency formatting via CurrencyContext
