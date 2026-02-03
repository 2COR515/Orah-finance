import { PrismaClient, ExpenseCategory, SavingsType, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@orahfinance.com' },
    update: {},
    create: {
      email: 'demo@orahfinance.com',
      name: 'Demo User',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create expenses for the past 3 months using actual categories from schema
  const expenseData = [
    // January 2026
    { category: ExpenseCategory.FOOD, amount: 15000, description: 'Monthly groceries', date: new Date('2026-01-05') },
    { category: ExpenseCategory.FOOD, amount: 3500, description: 'Restaurant dinner', date: new Date('2026-01-12') },
    { category: ExpenseCategory.TRANSPORT, amount: 8000, description: 'Fuel', date: new Date('2026-01-03') },
    { category: ExpenseCategory.TRANSPORT, amount: 2500, description: 'Uber rides', date: new Date('2026-01-15') },
    { category: ExpenseCategory.COMMUNICATION_BUNDLES, amount: 3500, description: 'Internet subscription', date: new Date('2026-01-08') },
    { category: ExpenseCategory.COMMUNICATION_CALLS, amount: 1500, description: 'Phone calls', date: new Date('2026-01-10') },
    { category: ExpenseCategory.COMMUNICATION_SMS, amount: 500, description: 'SMS bundle', date: new Date('2026-01-10') },
    { category: ExpenseCategory.TITHES, amount: 15000, description: 'Monthly tithe', date: new Date('2026-01-05') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2026-01-05') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2026-01-12') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2026-01-19') },
    { category: ExpenseCategory.OFFERINGS_TUESDAY, amount: 1000, description: 'Tuesday offering', date: new Date('2026-01-07') },
    { category: ExpenseCategory.OFFERINGS_TUESDAY, amount: 1000, description: 'Tuesday offering', date: new Date('2026-01-14') },
    { category: ExpenseCategory.OFFERINGS_HONORARIUM, amount: 5000, description: 'Pastor honorarium', date: new Date('2026-01-20') },
    { category: ExpenseCategory.OFFERINGS_BRICK_LAYERS, amount: 3000, description: 'Building fund', date: new Date('2026-01-12') },
    { category: ExpenseCategory.OTHER_GIVING_BIRTHDAYS, amount: 2000, description: 'Birthday gift', date: new Date('2026-01-18') },
    { category: ExpenseCategory.OTHER_GIVING_LUNCH, amount: 1500, description: 'Lunch for friend', date: new Date('2026-01-20') },
    { category: ExpenseCategory.RENT, amount: 35000, description: 'Monthly rent', date: new Date('2026-01-01') },
    { category: ExpenseCategory.MISCELLANEOUS, amount: 5000, description: 'Miscellaneous expenses', date: new Date('2026-01-22') },
    
    // December 2025
    { category: ExpenseCategory.FOOD, amount: 18000, description: 'Groceries & holiday food', date: new Date('2025-12-20') },
    { category: ExpenseCategory.FOOD, amount: 8000, description: 'Christmas dinner', date: new Date('2025-12-25') },
    { category: ExpenseCategory.TRANSPORT, amount: 12000, description: 'Holiday travel', date: new Date('2025-12-23') },
    { category: ExpenseCategory.COMMUNICATION_BUNDLES, amount: 3500, description: 'Internet', date: new Date('2025-12-08') },
    { category: ExpenseCategory.TITHES, amount: 15000, description: 'Monthly tithe', date: new Date('2025-12-05') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2500, description: 'Christmas offering', date: new Date('2025-12-25') },
    { category: ExpenseCategory.OTHER_GIVING_BIRTHDAYS, amount: 15000, description: 'Holiday gifts', date: new Date('2025-12-24') },
    { category: ExpenseCategory.MISCELLANEOUS, amount: 25000, description: 'Holiday shopping', date: new Date('2025-12-15') },
    { category: ExpenseCategory.RENT, amount: 35000, description: 'Monthly rent', date: new Date('2025-12-01') },
    
    // November 2025
    { category: ExpenseCategory.FOOD, amount: 14000, description: 'Monthly groceries', date: new Date('2025-11-05') },
    { category: ExpenseCategory.TRANSPORT, amount: 7500, description: 'Fuel', date: new Date('2025-11-08') },
    { category: ExpenseCategory.COMMUNICATION_BUNDLES, amount: 3500, description: 'Internet', date: new Date('2025-11-08') },
    { category: ExpenseCategory.COMMUNICATION_CALLS, amount: 1200, description: 'Phone calls', date: new Date('2025-11-10') },
    { category: ExpenseCategory.TITHES, amount: 15000, description: 'Monthly tithe', date: new Date('2025-11-05') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2025-11-02') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2025-11-09') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2025-11-16') },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 2000, description: 'Sunday offering', date: new Date('2025-11-23') },
    { category: ExpenseCategory.OTHER_GIVING_FUNERALS, amount: 5000, description: 'Funeral contribution', date: new Date('2025-11-15') },
    { category: ExpenseCategory.MISCELLANEOUS, amount: 8000, description: 'Miscellaneous', date: new Date('2025-11-20') },
    { category: ExpenseCategory.RENT, amount: 35000, description: 'Monthly rent', date: new Date('2025-11-01') },
  ];

  for (const expense of expenseData) {
    await prisma.expense.create({
      data: {
        ...expense,
        currency: 'KES',
        userId: user.id,
      },
    });
  }

  console.log('✅ Created', expenseData.length, 'expenses');

  // Create savings goals
  const savingsData = [
    {
      name: 'Emergency Fund',
      type: SavingsType.EMERGENCY,
      goalAmount: 300000,
      amountSaved: 175000,
      targetDate: new Date('2026-12-31'),
    },
    {
      name: 'New Laptop',
      type: SavingsType.SINKING,
      goalAmount: 150000,
      amountSaved: 85000,
      targetDate: new Date('2026-06-30'),
    },
    {
      name: 'Vacation Fund',
      type: SavingsType.SINKING,
      goalAmount: 200000,
      amountSaved: 45000,
      targetDate: new Date('2026-08-15'),
    },
    {
      name: 'Investment Portfolio',
      type: SavingsType.LONG_TERM,
      goalAmount: 1000000,
      amountSaved: 250000,
      targetDate: new Date('2030-12-31'),
    },
    {
      name: 'House Down Payment',
      type: SavingsType.LONG_TERM,
      goalAmount: 2000000,
      amountSaved: 320000,
      targetDate: new Date('2028-12-31'),
    },
  ];

  for (const savings of savingsData) {
    const savedGoal = await prisma.savings.create({
      data: {
        ...savings,
        currency: 'KES',
        userId: user.id,
      },
    });

    // Add some deposit history
    const deposits = [
      { amount: Math.round(savings.amountSaved * 0.4), dateSaved: new Date('2025-10-15'), note: 'Initial deposit' },
      { amount: Math.round(savings.amountSaved * 0.3), dateSaved: new Date('2025-11-15'), note: 'Monthly deposit' },
      { amount: Math.round(savings.amountSaved * 0.3), dateSaved: new Date('2025-12-15'), note: 'Monthly deposit' },
    ];

    for (const deposit of deposits) {
      await prisma.savingsDeposit.create({
        data: {
          amount: deposit.amount,
          currency: 'KES',
          dateSaved: deposit.dateSaved,
          note: deposit.note,
          savingsId: savedGoal.id,
        },
      });
    }
  }

  console.log('✅ Created', savingsData.length, 'savings goals with deposits');

  // Create transactions (income and expenses)
  const transactionData = [
    // Income
    { type: TransactionType.INCOME, category: 'Salary', amount: 150000, description: 'January salary', date: new Date('2026-01-28') },
    { type: TransactionType.INCOME, category: 'Salary', amount: 150000, description: 'December salary', date: new Date('2025-12-28') },
    { type: TransactionType.INCOME, category: 'Salary', amount: 150000, description: 'November salary', date: new Date('2025-11-28') },
    { type: TransactionType.INCOME, category: 'Freelance', amount: 35000, description: 'Web design project', date: new Date('2026-01-15') },
    { type: TransactionType.INCOME, category: 'Freelance', amount: 25000, description: 'Logo design', date: new Date('2025-12-10') },
    { type: TransactionType.INCOME, category: 'Investment', amount: 8000, description: 'Dividend payment', date: new Date('2026-01-20') },
    
    // Expenses (summary transactions)
    { type: TransactionType.EXPENSE, category: 'Bills', amount: 45000, description: 'Monthly bills', date: new Date('2026-01-10') },
    { type: TransactionType.EXPENSE, category: 'Rent', amount: 35000, description: 'Monthly rent', date: new Date('2026-01-01') },
    { type: TransactionType.EXPENSE, category: 'Bills', amount: 48000, description: 'Monthly bills', date: new Date('2025-12-10') },
    { type: TransactionType.EXPENSE, category: 'Rent', amount: 35000, description: 'Monthly rent', date: new Date('2025-12-01') },

    // Savings deposits
    { type: TransactionType.SAVINGS_DEPOSIT, category: 'Emergency Fund', amount: 20000, description: 'Monthly savings', date: new Date('2026-01-05') },
    { type: TransactionType.SAVINGS_DEPOSIT, category: 'Vacation', amount: 10000, description: 'Vacation savings', date: new Date('2026-01-05') },
  ];

  for (const transaction of transactionData) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        currency: 'KES',
        userId: user.id,
      },
    });
  }

  console.log('✅ Created', transactionData.length, 'transactions');

  // Create budgets
  const budgetData = [
    { category: ExpenseCategory.FOOD, amount: 25000, month: 1, year: 2026 },
    { category: ExpenseCategory.TRANSPORT, amount: 15000, month: 1, year: 2026 },
    { category: ExpenseCategory.COMMUNICATION_BUNDLES, amount: 5000, month: 1, year: 2026 },
    { category: ExpenseCategory.COMMUNICATION_CALLS, amount: 2000, month: 1, year: 2026 },
    { category: ExpenseCategory.TITHES, amount: 15000, month: 1, year: 2026 },
    { category: ExpenseCategory.OFFERINGS_SUNDAY, amount: 10000, month: 1, year: 2026 },
    { category: ExpenseCategory.RENT, amount: 40000, month: 1, year: 2026 },
    { category: ExpenseCategory.MISCELLANEOUS, amount: 15000, month: 1, year: 2026 },
  ];

  for (const budget of budgetData) {
    await prisma.budget.create({
      data: {
        ...budget,
        currency: 'KES',
        userId: user.id,
      },
    });
  }

  console.log('✅ Created', budgetData.length, 'budgets');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
