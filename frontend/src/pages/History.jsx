import React, { useEffect, useState, useCallback } from 'react';
import { Clock, RefreshCw, HeartPulse, ShieldAlert, Database } from 'lucide-react';
import PredictionTable from '../components/PredictionTable/PredictionTable';
import healthApi from '../services/api';
import { useToast } from '../context/ToastContext';

const History = () => {
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    databaseConnected: true,
    dbNotice: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const { addToast } = useToast();

  const fetchHistory = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    try {
      const res = await healthApi.getHistory({
        page: targetPage,
        limit: data.limit,
        search: search.trim() || undefined,
        prediction: predictionFilter !== 'All' ? predictionFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      setData({
        items: res.items || [],
        total: res.total || 0,
        page: res.page || targetPage,
        limit: res.limit || 10,
        totalPages: res.total_pages || 1,
        databaseConnected: res.database_connected !== false,
        dbNotice: res.db_notice
      });
    } catch (err) {
      addToast(err.message || 'Failed to fetch prediction history records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [data.limit, search, predictionFilter, sortBy, sortOrder, addToast]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await healthApi.deletePrediction(id);
      addToast(`Record #${id} was deleted successfully.`, 'success');
      // Refresh current page or previous page if last item
      fetchHistory(data.page);
    } catch (err) {
      addToast(err.message || `Failed to delete record #${id}.`, 'error');
    }
  };

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleFilterChange = (val) => {
    setPredictionFilter(val);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Database Audit Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Prediction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and inspect previous diabetes risk assessments stored in MySQL.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(data.page)}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* DATABASE STATUS WARNING */}
      {data.databaseConnected === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start space-x-3.5 text-xs sm:text-sm">
          <Database className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-950 dark:text-amber-100 flex items-center space-x-2">
              <span>MySQL Database Offline / Unconnected</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Notice
              </span>
            </div>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Historical records are loaded from and saved to your MySQL database. 
              To view audit history or save predictions, configure your database credentials in <code className="px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 font-mono text-[11px] font-semibold">backend/.env</code> and run <code className="px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 font-mono text-[11px] font-semibold">./venv/bin/python backend/init_db.py</code>.
            </p>
          </div>
        </div>
      )}

      {/* Prediction History Table */}
      <PredictionTable
        items={data.items}
        total={data.total}
        page={data.page}
        limit={data.limit}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default History;
