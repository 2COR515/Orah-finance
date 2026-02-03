'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Budget {
  id: string;
  category: string;
  amount: number;
  currency: string;
  month: number;
  year: number;
  spent?: number;
}

const CATEGORY_GRADIENTS: Record<string, { bg: string; gradient: string; border: string }> = {
  FOOD: { bg: 'bg-orange-500/10', gradient: 'from-orange-500 to-amber-500', border: 'border-orange-500/30' },
  TRANSPORT: { bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-indigo-500', border: 'border-blue-500/30' },
  RENT: { bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-violet-500', border: 'border-purple-500/30' },
  TITHES: { bg: 'bg-yellow-500/10', gradient: 'from-yellow-500 to-amber-500', border: 'border-yellow-500/30' },
  OFFERINGS_SUNDAY: { bg: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-green-500', border: 'border-emerald-500/30' },
  OFFERINGS_TUESDAY: { bg: 'bg-teal-500/10', gradient: 'from-teal-500 to-cyan-500', border: 'border-teal-500/30' },
  OFFERINGS_HONORARIUM: { bg: 'bg-cyan-500/10', gradient: 'from-cyan-500 to-blue-500', border: 'border-cyan-500/30' },
  OFFERINGS_BRICK_LAYERS: { bg: 'bg-indigo-500/10', gradient: 'from-indigo-500 to-purple-500', border: 'border-indigo-500/30' },
  COMMUNICATION_BUNDLES: { bg: 'bg-pink-500/10', gradient: 'from-pink-500 to-rose-500', border: 'border-pink-500/30' },
  COMMUNICATION_CALLS: { bg: 'bg-rose-500/10', gradient: 'from-rose-500 to-red-500', border: 'border-rose-500/30' },
  COMMUNICATION_SMS: { bg: 'bg-red-500/10', gradient: 'from-red-500 to-rose-500', border: 'border-red-500/30' },
  OTHER_GIVING_BIRTHDAYS: { bg: 'bg-amber-500/10', gradient: 'from-amber-500 to-yellow-500', border: 'border-amber-500/30' },
  OTHER_GIVING_FUNERALS: { bg: 'bg-slate-500/10', gradient: 'from-slate-500 to-gray-500', border: 'border-slate-500/30' },
  OTHER_GIVING_LUNCH: { bg: 'bg-lime-500/10', gradient: 'from-lime-500 to-green-500', border: 'border-lime-500/30' },
  MISCELLANEOUS: { bg: 'bg-gray-500/10', gradient: 'from-gray-500 to-slate-500', border: 'border-gray-500/30' },
};

const CATEGORY_LABELS: Record<string, string> = {
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
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BudgetsPage() {
  const { format: formatAmount } = useCurrency();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<{ category: string; amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Form state
  const [newBudget, setNewBudget] = useState({
    category: 'FOOD',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch budgets
      const budgetRes = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudgets(budgetData);
      }

      // Fetch expenses for the month to calculate spent amounts
      // Start of month (day 1)
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
      // End of month (last day at 23:59:59.999)
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).toISOString();
      const expenseRes = await fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`);
      if (expenseRes.ok) {
        const expenseData = await expenseRes.json();
        // Group expenses by category
        const grouped = expenseData.reduce((acc: Record<string, number>, expense: { category: string; amount: number }) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {});
        setExpenses(Object.entries(grouped).map(([category, amount]) => ({ category, amount: amount as number })));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newBudget.category,
          amount: parseFloat(newBudget.amount),
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowAddModal(false);
        setNewBudget({ category: 'FOOD', amount: '' });
      }
    } catch (error) {
      console.error('Failed to add budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(newBudget.amount),
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditingBudget(null);
        setNewBudget({ category: 'FOOD', amount: '' });
      }
    } catch (error) {
      console.error('Failed to update budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBudgets(budgets.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  const getSpentAmount = (category: string) => {
    const expense = expenses.find((e) => e.category === category);
    return expense?.amount || 0;
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpentAmount(b.category), 0);
  const remainingBudget = totalBudget - totalSpent;

  const existingCategories = budgets.map(b => b.category);
  const availableCategories = Object.keys(CATEGORY_LABELS).filter(
    cat => !existingCategories.includes(cat)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="group w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Budgets</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Set and track spending limits
              </p>
            </div>
          </div>
          
          {availableCategories.length > 0 && (
            <button
              onClick={() => {
                setNewBudget({ category: availableCategories[0] || 'FOOD', amount: '' });
                setShowAddModal(true);
              }}
              className="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Add Budget</span>
            </button>
          )}
        </div>

        {/* Month Selector */}
        <div className="evervault-card rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1} className="bg-[#0a0a0f]">
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year} className="bg-[#0a0a0f]">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <span className="text-gray-500">Budget:</span>
                <span className="ml-2 font-bold text-white">{formatAmount(totalBudget)}</span>
              </div>
              <div className="px-3 py-2 bg-rose-500/5 rounded-lg border border-rose-500/20">
                <span className="text-gray-500">Spent:</span>
                <span className="ml-2 font-bold text-rose-400">{formatAmount(totalSpent)}</span>
              </div>
              <div className={`px-3 py-2 rounded-lg border ${remainingBudget >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <span className="text-gray-500">Remaining:</span>
                <span className={`ml-2 font-bold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatAmount(remainingBudget)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="evervault-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">No budgets set for {MONTHS[selectedMonth - 1]} {selectedYear}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Set your first budget →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const spent = getSpentAmount(budget.category);
              const progress = (spent / budget.amount) * 100;
              const isOverBudget = spent > budget.amount;
              const isNearLimit = progress >= 80 && progress < 100;
              
              return (
                <div key={budget.id} className="evervault-card rounded-xl p-5 hover:border-white/[0.15] transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[budget.category]?.gradient || 'from-gray-500 to-slate-500'} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm font-bold">
                          {CATEGORY_LABELS[budget.category]?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{CATEGORY_LABELS[budget.category]}</h3>
                        <p className="text-xs text-gray-500">Monthly budget</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingBudget(budget);
                          setNewBudget({ category: budget.category, amount: budget.amount.toString() });
                        }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-bold text-white">{formatAmount(spent)}</span>
                      <span className="text-sm text-gray-500">/ {formatAmount(budget.amount)}</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget 
                            ? 'bg-gradient-to-r from-rose-500 to-red-500' 
                            : isNearLimit 
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${
                      isOverBudget ? 'text-rose-400' : isNearLimit ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {progress.toFixed(0)}% used
                    </span>
                    {isOverBudget ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Over budget
                      </span>
                    ) : isNearLimit ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Near limit
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        On track
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      {(showAddModal || editingBudget) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="evervault-card rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingBudget ? 'Edit Budget' : 'Add Budget'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBudget(null);
                  setNewBudget({ category: 'FOOD', amount: '' });
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget} className="p-6 space-y-5">
              {!editingBudget && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  >
                    {availableCategories.map((key) => (
                      <option key={key} value={key} className="bg-[#0a0a0f]">
                        {CATEGORY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {editingBudget && (
                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[editingBudget.category]?.gradient || 'from-gray-500 to-slate-500'} flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">
                      {CATEGORY_LABELS[editingBudget.category]?.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold text-white">{CATEGORY_LABELS[editingBudget.category]}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBudget(null);
                    setNewBudget({ category: 'FOOD', amount: '' });
                  }}
                  className="flex-1 py-3 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-gray-300 font-semibold hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingBudget ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingBudget ? 'Update Budget' : 'Add Budget'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
