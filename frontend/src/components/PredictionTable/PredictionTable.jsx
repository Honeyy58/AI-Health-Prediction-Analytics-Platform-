import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  X,
  HeartPulse,
  Calendar,
  Activity,
  Droplet,
  Scale,
  Cigarette,
  User
} from 'lucide-react';

const PredictionTable = ({
  items = [],
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  onPageChange,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onDelete,
  isLoading,
  error
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange?.(searchInput);
  };

  const handleFilterSelect = (val) => {
    setPredictionFilter(val);
    onFilterChange?.(val);
  };

  const handleSortToggle = (field) => {
    let newOrder = 'desc';
    if (sortBy === field) {
      newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    }
    setSortBy(field);
    setSortOrder(newOrder);
    onSortChange?.(field, newOrder);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    await onDelete?.(recordToDelete.id);
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by ID, gender, or smoking history..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        {/* Filter Badges */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 hidden lg:inline">Filter:</span>
          {['All', 'Positive', 'Negative'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterSelect(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                predictionFilter === f
                  ? f === 'Positive'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : f === 'Negative'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
              <tr>
                <th 
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSortToggle('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSortToggle('age')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white hidden md:table-cell"
                  onClick={() => handleSortToggle('bmi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>BMI</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">HbA1c</th>
                <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Glucose</th>
                <th className="py-3.5 px-4 font-semibold">Prediction</th>
                <th 
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => handleSortToggle('confidence')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Confidence</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white hidden xl:table-cell"
                  onClick={() => handleSortToggle('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-8"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                    <td className="py-4 px-4 hidden md:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                    <td className="py-4 px-4 hidden lg:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                    <td className="py-4 px-4 hidden sm:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-14"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                    <td className="py-4 px-4 hidden xl:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                // Empty State Row
                <tr>
                  <td colSpan="9" className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                        <HeartPulse className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">
                        No predictions yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Create your first health prediction to see historical records and analytics here.
                      </p>
                      <Link
                        to="/predict"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
                      >
                        <HeartPulse className="w-4 h-4" />
                        <span>Make Prediction</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const isPos = row.prediction === 'Positive';
                  const formattedDate = row.created_at
                    ? new Date(row.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '—';

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{row.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.age} yrs
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {row.gender}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        {row.bmi}
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        {row.hba1c_level}%
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        {row.blood_glucose_level} mg/dL
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                            isPos
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {row.prediction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {row.confidence}%
                      </td>
                      <td className="py-3.5 px-4 hidden xl:table-cell text-slate-400 text-xs">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Record Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <span className="text-slate-500">
              Showing page <span className="font-semibold text-slate-800 dark:text-white">{page}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span> ({total} total records)
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
                  Assessment Detail
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Prediction Record #{selectedRecord.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Highlight */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              selectedRecord.prediction === 'Positive'
                ? 'bg-rose-500/10 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400'
                : 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
            }`}>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider">Model Prediction</div>
                <div className="text-lg font-extrabold">{selectedRecord.prediction}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase tracking-wider">Confidence</div>
                <div className="text-lg font-mono font-extrabold">{selectedRecord.confidence}%</div>
              </div>
            </div>

            {/* Biomarker Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">Patient Profile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.gender}, {selectedRecord.age} yrs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">Smoking Status</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedRecord.smoking_history}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">Hypertension</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.hypertension ? 'Yes' : 'No'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">Heart Disease</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.heart_disease ? 'Yes' : 'No'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">BMI</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.bmi} kg/m²</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block">HbA1c Level</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.hba1c_level}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 col-span-2">
                <span className="text-slate-400 block">Blood Glucose Level</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.blood_glucose_level} mg/dL</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Prediction Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete record #{recordToDelete.id}? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionTable;
