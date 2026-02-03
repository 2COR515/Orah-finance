'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Loader2,
  CheckCircle,
  PieChart,
  TrendingUp,
  Wallet,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

type ReportType = 'expenses' | 'savings' | 'summary';
type ReportFormat = 'pdf' | 'csv';
type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsPage() {
  const { currency } = useCurrency();
  
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reportTypes = [
    { 
      id: 'summary' as const, 
      name: 'Financial Summary', 
      description: 'Overview of income, expenses, and savings',
      icon: <Wallet className="w-5 h-5" />,
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    },
    { 
      id: 'expenses' as const, 
      name: 'Expenses Report', 
      description: 'Detailed breakdown by category',
      icon: <PieChart className="w-5 h-5" />,
      gradient: 'from-rose-500 to-orange-500',
      bgLight: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400'
    },
    { 
      id: 'savings' as const, 
      name: 'Savings Report', 
      description: 'Progress on all savings goals',
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    },
  ];

  const dateRanges = [
    { id: 'week' as const, name: 'This Week' },
    { id: 'month' as const, name: 'This Month' },
    { id: 'quarter' as const, name: 'This Quarter' },
    { id: 'year' as const, name: 'This Year' },
    { id: 'custom' as const, name: 'Custom Range' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const params = new URLSearchParams({
        type: reportType,
        format: reportFormat,
        range: dateRange,
        currency: currency.code,
      });

      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      }

      const response = await fetch(`/api/reports?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orahfinance-${reportType}-report.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="group w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Reports</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Generate and download financial reports
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="evervault-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Select Report Type</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    reportType === type.id
                      ? `bg-gradient-to-br ${type.gradient} text-white shadow-lg`
                      : `bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] text-gray-300`
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {type.icon}
                    <span className="font-semibold">{type.name}</span>
                  </div>
                  <p className={`text-xs ${reportType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="evervault-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              Date Range
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    dateRange === range.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                      : 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  {range.name}
                </button>
              ))}
            </div>
            
            {dateRange === 'custom' && (
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.08]">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="evervault-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Export Format</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setReportFormat('pdf')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                  reportFormat === 'pdf'
                    ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white/[0.02] border border-white/[0.08] text-gray-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <FileText className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">PDF Document</p>
                  <p className={`text-xs ${reportFormat === 'pdf' ? 'text-white/80' : 'text-gray-500'}`}>
                    Best for printing
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => setReportFormat('csv')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                  reportFormat === 'csv'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white/[0.02] border border-white/[0.08] text-gray-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">CSV Spreadsheet</p>
                  <p className={`text-xs ${reportFormat === 'csv' ? 'text-white/80' : 'text-gray-500'}`}>
                    For Excel/Sheets
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || (dateRange === 'custom' && (!customStartDate || !customEndDate))}
            className="group relative w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10">Generating Report...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Download Complete!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Generate & Download Report</span>
              </>
            )}
          </button>

          {/* Info Card */}
          <div className="evervault-card rounded-xl p-4 border-cyan-500/20">
            <p className="text-sm text-gray-400">
              <span className="text-cyan-400 font-semibold">Tip:</span> Reports are generated based on your current currency setting ({currency.code}). 
              All amounts will be displayed in {currency.name}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
