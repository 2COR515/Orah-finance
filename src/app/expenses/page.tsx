'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Trash2,
  Edit2,
  ChevronDown,
  X,
  Loader2,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  FOOD: 'from-orange-500 to-amber-500',
  TRANSPORT: 'from-blue-500 to-indigo-500',
  RENT: 'from-purple-500 to-violet-500',
  TITHES: 'from-yellow-500 to-amber-500',
  OFFERINGS_SUNDAY: 'from-emerald-500 to-teal-500',
  OFFERINGS_TUESDAY: 'from-teal-500 to-cyan-500',
  OFFERINGS_HONORARIUM: 'from-cyan-500 to-blue-500',
  OFFERINGS_BRICK_LAYERS: 'from-indigo-500 to-violet-500',
  COMMUNICATION_BUNDLES: 'from-pink-500 to-rose-500',
  COMMUNICATION_CALLS: 'from-rose-500 to-red-500',
  COMMUNICATION_SMS: 'from-red-500 to-orange-500',
  OTHER_GIVING_BIRTHDAYS: 'from-amber-500 to-yellow-500',
  OTHER_GIVING_FUNERALS: 'from-slate-500 to-gray-500',
  OTHER_GIVING_LUNCH: 'from-lime-500 to-green-500',
  MISCELLANEOUS: 'from-gray-500 to-slate-500',
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

export default function ExpensesPage() {
  const { data: session } = useSession();
  const { format: formatAmount } = useCurrency();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Form state
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'FOOD',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          description: newExpense.description || null,
          date: new Date(newExpense.date).toISOString(),
        }),
      });

      if (response.ok) {
        const expense = await response.json();
        setExpenses([expense, ...expenses]);
        setShowAddModal(false);
        setNewExpense({
          amount: '',
          category: 'FOOD',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      CATEGORY_LABELS[expense.category]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Expenses</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Track and manage your spending
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>

        {/* Stats Card */}
        <div className="evervault-card rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">{formatAmount(totalExpenses)}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredExpenses.length} transactions</p>
              </div>
            </div>
            
            {/* Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300 w-48 sm:w-64"
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">
                    {selectedCategory === 'all' ? 'All Categories' : CATEGORY_LABELS[selectedCategory]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilterDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 evervault-card rounded-xl shadow-xl z-50 py-2 max-h-72 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedCategory('all'); setShowFilterDropdown(false); }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-white/[0.05] transition-all duration-200 ${selectedCategory === 'all' ? 'text-rose-400' : 'text-gray-300'}`}
                      >
                        All Categories
                      </button>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSelectedCategory(key); setShowFilterDropdown(false); }}
                          className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-white/[0.05] transition-all duration-200 flex items-center gap-2 ${selectedCategory === key ? 'text-rose-400' : 'text-gray-300'}`}
                        >
                          <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${CATEGORY_GRADIENTS[key]}`} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="evervault-card rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center animate-pulse">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-white font-semibold">No expenses found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-300 hover:to-pink-300 font-semibold transition-all"
              >
                Add your first expense →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="group flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[expense.category]} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">
                        {CATEGORY_LABELS[expense.category]?.charAt(0) || 'E'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {expense.description || CATEGORY_LABELS[expense.category]}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${CATEGORY_GRADIENTS[expense.category]} bg-opacity-20 border border-white/10`}>
                          {CATEGORY_LABELS[expense.category]}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                      -{formatAmount(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="evervault-card rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold text-white">Add Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-all duration-300"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-[#0a0a0f]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300"
                  placeholder="What was this expense for?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 font-semibold hover:bg-white/[0.06] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative flex-1 py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Expense'
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
