import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, HeartPulse } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          404 — Page Not Found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested route does not exist or has been relocated.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          to="/predict"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition"
        >
          <HeartPulse className="w-4 h-4" />
          <span>Start Prediction</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
