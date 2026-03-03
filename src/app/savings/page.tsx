'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Target,
  TrendingUp,
  Clock,
  Wallet,
  X,
  Loader2,
  Trash2,
  PiggyBank,
  Sparkles,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SavingsDeposit {
  id: string;
  amount: number;
  dateSaved: string;
  note: string | null;
}

interface Savings {
  id: string;
  name: string;
  type: string;
  goalAmount: number;
  amountSaved: number;
  currency: string;
  startDate: string;
  targetDate: string | null;
  isActive: boolean;
  deposits?: SavingsDeposit[];
}

const TYPE_GRADIENTS: Record<string, { bg: string; text: string; gradient: string; border: string }> = {
  EMERGENCY: { 
    bg: 'bg-rose-500/10', 
    text: 'text-rose-400',
    gradient: 'from-rose-500 to-orange-500',
    border: 'border-rose-500/30'
  },
  SINKING: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30'
  },
  LONG_TERM: { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30'
  },
};

const TYPE_LABELS: Record<string, string> = {
  EMERGENCY: 'Emergency Fund',
  SINKING: 'Sinking Fund',
  LONG_TERM: 'Long-term Goal',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  EMERGENCY: <Wallet className="w-5 h-5" />,
  SINKING: <Clock className="w-5 h-5" />,
  LONG_TERM: <TrendingUp className="w-5 h-5" />,
};

export default function SavingsPage() {
  const { data: session } = useSession();
  const { format: formatAmount } = useCurrency();
  
  const [savings, setSavings] = useState<Savings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [goalDeposits, setGoalDeposits] = useState<Record<string, SavingsDeposit[]>>({});
  const [loadingDeposits, setLoadingDeposits] = useState<string | null>(null);
  
  // Form state
  const [newSavings, setNewSavings] = useState({
    name: '',
    type: 'SINKING',
    goalAmount: '',
    targetDate: '',
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const response = await fetch('/api/savings');
      if (response.ok) {
        const data = await response.json();
        setSavings(data);
      }
    } catch (error) {
      console.error('Failed to fetch savings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSavings.name,
          type: newSavings.type,
          goalAmount: parseFloat(newSavings.goalAmount),
          targetDate: newSavings.targetDate ? new Date(newSavings.targetDate).toISOString() : null,
        }),
      });

      if (response.ok) {
        const savingsGoal = await response.json();
        setSavings([savingsGoal, ...savings]);
        setShowAddModal(false);
        setNewSavings({
          name: '',
          type: 'SINKING',
          goalAmount: '',
          targetDate: '',
        });
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(`⚡ Upgrade Required\n\n${data.error}\n\nCurrent plan: ${data.tier}`);
        } else {
          alert(data.error || 'Failed to add savings goal');
        }
      }
    } catch (error) {
      console.error('Failed to add savings:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async (savingsId: string) => {
    if (!depositAmount) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/savings/${savingsId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
        }),
      });

      if (response.ok) {
        await fetchSavings();
        setShowDepositModal(null);
        setDepositAmount('');
      }
    } catch (error) {
      console.error('Failed to deposit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSavings = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;

    try {
      const response = await fetch(`/api/savings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavings(savings.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete savings:', error);
    }
  };

  const fetchDeposits = async (savingsId: string) => {
    if (goalDeposits[savingsId]) {
      // Already loaded, just toggle
      setExpandedGoal(expandedGoal === savingsId ? null : savingsId);
      return;
    }

    setLoadingDeposits(savingsId);
    try {
      const response = await fetch(`/api/savings/${savingsId}`);
      if (response.ok) {
        const data = await response.json();
        setGoalDeposits((prev) => ({ ...prev, [savingsId]: data.deposits || [] }));
        setExpandedGoal(savingsId);
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    } finally {
      setLoadingDeposits(null);
    }
  };

  const handleDeleteDeposit = async (savingsId: string, depositId: string) => {
    if (!confirm('Are you sure you want to delete this deposit entry?')) return;

    try {
      const response = await fetch(`/api/savings/${savingsId}/deposit/${depositId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setGoalDeposits((prev) => ({
          ...prev,
          [savingsId]: prev[savingsId].filter((d) => d.id !== depositId),
        }));
        // Refresh savings to update the total
        await fetchSavings();
      }
    } catch (error) {
      console.error('Failed to delete deposit:', error);
    }
  };

  const totalSaved = savings.reduce((sum, s) => sum + s.amountSaved, 0);
  const totalGoal = savings.reduce((sum, s) => sum + s.goalAmount, 0);
  const overallProgress = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

  const groupedSavings = savings.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, Savings[]>);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[128px]" />
      
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
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Savings Goals</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Track your financial goals
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="hidden sm:inline relative z-10">New Goal</span>
          </button>
        </div>

        {/* Overview Card */}
        <div className="evervault-card rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{formatAmount(totalSaved)}</p>
                <p className="text-sm text-gray-500 mt-1">of {formatAmount(totalGoal)} goal</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-emerald-400 font-semibold">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Savings List by Type */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
          </div>
        ) : savings.length === 0 ? (
          <div className="evervault-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">No savings goals yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Create your first goal →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSavings).map(([type, goals]) => (
              <div key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${TYPE_GRADIENTS[type].bg} ${TYPE_GRADIENTS[type].border} border`}>
                    <span className={TYPE_GRADIENTS[type].text}>{TYPE_ICONS[type]}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{TYPE_LABELS[type]}</h2>
                  <span className="text-sm text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.05]">({goals.length})</span>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {goals.map((goal) => {
                    const progress = (goal.amountSaved / goal.goalAmount) * 100;
                    const daysLeft = goal.targetDate 
                      ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpanded = expandedGoal === goal.id;
                    const deposits = goalDeposits[goal.id] || [];
                    
                    return (
                      <div key={goal.id} className="evervault-card rounded-xl p-5 hover:border-white/[0.15] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">{goal.name}</h3>
                            {daysLeft !== null && (
                              <p className={`text-xs mt-1 font-medium ${daysLeft < 30 ? 'text-amber-400' : 'text-gray-500'}`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteSavings(goal.id)}
                            className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-end justify-between mb-2">
                            <span className="text-2xl font-bold text-white">{formatAmount(goal.amountSaved)}</span>
                            <span className="text-sm text-gray-500">/ {formatAmount(goal.goalAmount)}</span>
                          </div>
                          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
                            <div 
                              className={`h-full bg-gradient-to-r ${TYPE_GRADIENTS[goal.type].gradient} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className={`text-xs mt-1.5 font-medium ${TYPE_GRADIENTS[goal.type].text}`}>
                            {progress.toFixed(1)}% complete
                          </p>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setShowDepositModal(goal.id)}
                            className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
                          >
                            + Add Deposit
                          </button>
                          <button
                            onClick={() => fetchDeposits(goal.id)}
                            className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 flex items-center gap-1"
                          >
                            {loadingDeposits === goal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <History className="w-4 h-4" />
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </>
                            )}
                          </button>
                        </div>

                        {/* Deposit History */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/[0.08]">
                            <p className="text-xs font-semibold text-gray-400 mb-2">Deposit History</p>
                            {deposits.length === 0 ? (
                              <p className="text-xs text-gray-500">No deposits yet</p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {deposits.map((deposit) => (
                                  <div key={deposit.id} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                                    <div>
                                      <p className="text-sm font-medium text-white">{formatAmount(deposit.amount)}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(deposit.dateSaved).toLocaleDateString()}
                                        {deposit.note && ` • ${deposit.note}`}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteDeposit(goal.id, deposit.id)}
                                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                                      title="Delete this deposit"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Savings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="evervault-card rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">New Savings Goal</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSavings} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newSavings.name}
                  onChange={(e) => setNewSavings({ ...newSavings, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="e.g., Vacation Fund"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Goal Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewSavings({ ...newSavings, type: key })}
                      className={`p-3 rounded-xl text-center transition-all duration-300 ${
                        newSavings.type === key 
                          ? `bg-gradient-to-br ${TYPE_GRADIENTS[key].gradient} text-white shadow-lg` 
                          : 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex justify-center mb-1">{TYPE_ICONS[key]}</div>
                      <span className="text-xs font-semibold">{label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newSavings.goalAmount}
                  onChange={(e) => setNewSavings({ ...newSavings, goalAmount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={newSavings.targetDate}
                  onChange={(e) => setNewSavings({ ...newSavings, targetDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-gray-300 font-semibold hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Goal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="evervault-card rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Add Deposit</h2>
              </div>
              <button
                onClick={() => { setShowDepositModal(null); setDepositAmount(''); }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDepositModal(null); setDepositAmount(''); }}
                  className="flex-1 py-3 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-gray-300 font-semibold hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeposit(showDepositModal)}
                  disabled={isSubmitting || !depositAmount}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    'Deposit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
