'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  X, 
  DollarSign,
  Briefcase,
  TrendingUp,
  Gift,
  RefreshCw,
  Building,
  Loader2,
  Calendar,
  Filter,
  Repeat,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Income {
  id: string;
  amount: number;
  currency: string;
  category: string;
  source: string | null;
  description: string | null;
  date: string;
  isRecurring: boolean;
}

const INCOME_CATEGORIES = [
  { value: 'SALARY', label: 'Salary', icon: Briefcase, gradient: 'from-emerald-500 to-teal-500' },
  { value: 'BUSINESS', label: 'Business', icon: Building, gradient: 'from-blue-500 to-indigo-500' },
  { value: 'FREELANCE', label: 'Freelance', icon: TrendingUp, gradient: 'from-violet-500 to-purple-500' },
  { value: 'INVESTMENTS', label: 'Investments', icon: TrendingUp, gradient: 'from-cyan-500 to-teal-500' },
  { value: 'GIFTS', label: 'Gifts', icon: Gift, gradient: 'from-pink-500 to-rose-500' },
  { value: 'REFUNDS', label: 'Refunds', icon: RefreshCw, gradient: 'from-amber-500 to-yellow-500' },
  { value: 'SIDE_HUSTLE', label: 'Side Hustle', icon: DollarSign, gradient: 'from-orange-500 to-red-500' },
  { value: 'RENTAL', label: 'Rental Income', icon: Building, gradient: 'from-indigo-500 to-blue-500' },
  { value: 'BONUS', label: 'Bonus', icon: Gift, gradient: 'from-teal-500 to-emerald-500' },
  { value: 'OTHER', label: 'Other', icon: DollarSign, gradient: 'from-gray-500 to-slate-500' },
];

export default function IncomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { format: formatAmount, currency } = useCurrency();
  
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [newIncome, setNewIncome] = useState({
    amount: '',
    category: 'SALARY',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchIncomes();
    }
  }, [status]);

  const fetchIncomes = async () => {
    try {
      const res = await fetch('/api/income');
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(newIncome.amount),
          category: newIncome.category,
          source: newIncome.source || null,
          description: newIncome.description || null,
          date: newIncome.date,
          isRecurring: newIncome.isRecurring,
          currency: currency.code,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewIncome({
          amount: '',
          category: 'SALARY',
          source: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
        });
        fetchIncomes();
      }
    } catch (error) {
      console.error('Failed to add income:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;

    try {
      const res = await fetch(`/api/income/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIncomes();
      }
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const filteredIncomes = filter === 'ALL' 
    ? incomes 
    : incomes.filter(i => i.category === filter);

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const recurringIncome = incomes.filter(i => i.isRecurring).reduce((sum, i) => sum + i.amount, 0);

  const getCategoryInfo = (category: string) => {
    return INCOME_CATEGORIES.find(c => c.value === category) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
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
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Income</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Track your earnings
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Add Income
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="evervault-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center ml-auto">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{formatAmount(totalIncome)}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Total Income</p>
          </div>
          
          <div className="evervault-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                <Repeat className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{formatAmount(recurringIncome)}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Recurring Income</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              filter === 'ALL'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            All
          </button>
          {INCOME_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                filter === cat.value
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Income List */}
        <div className="evervault-card rounded-2xl overflow-hidden">
          {filteredIncomes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-semibold">No income records yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first income to start tracking</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredIncomes.map((income) => {
                const catInfo = getCategoryInfo(income.category);
                const IconComponent = catInfo.icon;
                
                return (
                  <div
                    key={income.id}
                    className="group flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${catInfo.gradient} bg-opacity-20 border border-white/10 flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{catInfo.label}</p>
                          {income.isRecurring && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {income.source || income.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(income.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        +{formatAmount(income.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
                        className="p-2.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Income Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="evervault-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
                <h2 className="text-xl font-bold text-white">Add Income</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-all duration-300"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddIncome} className="p-5 space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INCOME_CATEGORIES.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setNewIncome({ ...newIncome, category: cat.value })}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                            newIncome.category === cat.value
                              ? `bg-gradient-to-r ${cat.gradient} bg-opacity-20 border-white/20 text-white`
                              : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:border-white/[0.1]'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Source (Optional)</label>
                  <input
                    type="text"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="e.g., Company Name, Client"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Add a note"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    required
                  />
                </div>

                {/* Recurring Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <div>
                    <p className="text-white font-semibold">Recurring Income</p>
                    <p className="text-sm text-gray-500">Mark as regular income</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewIncome({ ...newIncome, isRecurring: !newIncome.isRecurring })}
                    className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                      newIncome.isRecurring ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                        newIncome.isRecurring ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">
                    {submitting ? 'Adding...' : 'Add Income'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
