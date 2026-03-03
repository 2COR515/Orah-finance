import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, format } from 'date-fns'
import { getSession } from '@/lib/api-auth'

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  RENT: 'Rent',
  TITHES: 'Tithes',
  OFFERINGS_SUNDAY: 'Sunday Offering',
  OFFERINGS_TUESDAY: 'Tuesday Offering',
  OFFERINGS_HONORARIUM: 'Honorarium',
  OFFERINGS_BRICK_LAYERS: 'Brick Layers',
  COMMUNICATION_BUNDLES: 'Data Bundles',
  COMMUNICATION_CALLS: 'Phone Calls',
  COMMUNICATION_SMS: 'SMS',
  OTHER_GIVING_BIRTHDAYS: 'Birthday Gifts',
  OTHER_GIVING_FUNERALS: 'Funeral Contributions',
  OTHER_GIVING_LUNCH: 'Lunch Treats',
  MISCELLANEOUS: 'Miscellaneous',
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'
    const reportFormat = searchParams.get('format') || 'csv'
    const range = searchParams.get('range') || 'month'
    const currencyCode = searchParams.get('currency') || 'KES'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (range) {
      case 'week':
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'quarter':
        startDate = startOfQuarter(now)
        endDate = endOfQuarter(now)
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : startOfMonth(now)
        endDate = customEndDate ? new Date(customEndDate) : endOfMonth(now)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const userId = session.user.id

    // Fetch data based on report type
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    })

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    })

    const savings = await prisma.savings.findMany({
      where: { userId },
    })

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0)
    const totalIncome = incomes.reduce((sum: number, inc: { amount: number }) => sum + inc.amount, 0)
    const totalSaved = savings.reduce((sum: number, s: { amountSaved: number }) => sum + s.amountSaved, 0)

    // Generate report content
    if (reportFormat === 'csv') {
      let csvContent = ''
      const periodStr = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`

      if (reportType === 'expenses') {
        csvContent = `OrahFinance Expenses Report\nPeriod: ${periodStr}\nCurrency: ${currencyCode}\n\n`
        csvContent += 'Date,Category,Description,Amount\n'
        for (const exp of expenses) {
          csvContent += `${format(exp.date, 'yyyy-MM-dd')},${EXPENSE_CATEGORY_LABELS[exp.category] || exp.category},"${exp.description || ''}",${exp.amount}\n`
        }
        csvContent += `\nTotal Expenses,,,${totalExpenses}\n`
      } else if (reportType === 'savings') {
        csvContent = `OrahFinance Savings Report\nPeriod: ${periodStr}\nCurrency: ${currencyCode}\n\n`
        csvContent += 'Goal Name,Type,Target Amount,Amount Saved,Progress %\n'
        for (const s of savings) {
          const progress = s.goalAmount > 0 ? Math.round((s.amountSaved / s.goalAmount) * 100) : 0
          csvContent += `"${s.name}",${s.type},${s.goalAmount},${s.amountSaved},${progress}%\n`
        }
        csvContent += `\nTotal Saved,,,${totalSaved},\n`
      } else {
        // Summary report
        csvContent = `OrahFinance Financial Summary\nPeriod: ${periodStr}\nCurrency: ${currencyCode}\n\n`
        csvContent += 'SUMMARY\n'
        csvContent += `Total Income,${totalIncome}\n`
        csvContent += `Total Expenses,${totalExpenses}\n`
        csvContent += `Total Savings,${totalSaved}\n`
        csvContent += `Net Balance,${totalIncome - totalExpenses}\n\n`
        
        csvContent += 'EXPENSES BY CATEGORY\n'
        csvContent += 'Category,Amount,Count\n'
        const expensesByCategory: Record<string, { total: number; count: number }> = {}
        for (const exp of expenses) {
          if (!expensesByCategory[exp.category]) expensesByCategory[exp.category] = { total: 0, count: 0 }
          expensesByCategory[exp.category].total += exp.amount
          expensesByCategory[exp.category].count += 1
        }
        const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1].total - a[1].total)
        for (const [cat, data] of sortedCategories) {
          csvContent += `${EXPENSE_CATEGORY_LABELS[cat] || cat},${data.total},${data.count}\n`
        }
        
        csvContent += '\nRECENT EXPENSES\n'
        csvContent += 'Date,Category,Description,Amount\n'
        for (const exp of expenses.slice(0, 20)) {
          csvContent += `${format(exp.date, 'yyyy-MM-dd')},${EXPENSE_CATEGORY_LABELS[exp.category] || exp.category},"${exp.description || ''}",${exp.amount}\n`
        }
        
        csvContent += '\nINCOME\n'
        csvContent += 'Date,Category,Source,Amount\n'
        for (const inc of incomes) {
          csvContent += `${format(inc.date, 'yyyy-MM-dd')},${inc.category},"${inc.source || ''}",${inc.amount}\n`
        }
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orahfinance-${reportType}-report.csv"`,
        },
      })
    } else {
      // PDF format - generate simple text-based PDF content
      const periodStr = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
      
      let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
4 0 obj
<< /Length 6 0 R >>
stream
BT
/F1 24 Tf
50 750 Td
(OrahFinance ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report) Tj
/F1 12 Tf
0 -30 Td
(Period: ${periodStr}) Tj
0 -15 Td
(Currency: ${currencyCode}) Tj
0 -30 Td
/F1 14 Tf
(Summary) Tj
/F1 12 Tf
0 -20 Td
(Total Income: ${currencyCode} ${totalIncome.toLocaleString()}) Tj
0 -15 Td
(Total Expenses: ${currencyCode} ${totalExpenses.toLocaleString()}) Tj
0 -15 Td
(Total Savings: ${currencyCode} ${totalSaved.toLocaleString()}) Tj
0 -15 Td
(Net Balance: ${currencyCode} ${(totalIncome - totalExpenses).toLocaleString()}) Tj
0 -30 Td
(Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}) Tj
ET
endstream
endobj
6 0 obj
800
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000214 00000 n 
0000001100 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1120
%%EOF`

      return new NextResponse(pdfContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="orahfinance-${reportType}-report.pdf"`,
        },
      })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
