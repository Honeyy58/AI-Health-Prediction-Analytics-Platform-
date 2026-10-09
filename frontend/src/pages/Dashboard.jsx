import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  HeartPulse, 
  Activity, 
  Scale, 
  Droplet, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Database
} from 'lucide-react';
import StatCard from '../components/StatCard/StatCard';
import PredictionDistributionChart from '../components/Charts/PredictionDistributionChart';
import PredictionsTimelineChart from '../components/Charts/PredictionsTimelineChart';
import PositiveNegativeBarChart from '../components/Charts/PositiveNegativeBarChart';
import GlucoseScatterChart from '../components/Charts/GlucoseScatterChart';
import healthApi from '../services/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToast } = useToast();

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await healthApi.getAnalytics();
      setAnalytics(data);
      if (isManualRefresh) {
        addToast('Dashboard analytics refreshed successfully.', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard metrics.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const total = analytics?.total_predictions || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <span>Clinical Intelligence Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Prediction Analytics & Risk Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated population metrics, distribution patterns, and machine learning inference logs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/predict"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition"
          >
            <HeartPulse className="w-4 h-4" />
            <span>New Prediction</span>
          </Link>
        </div>
      </div>

      {/* DATABASE STATUS WARNING */}
      {analytics?.database_connected === false && (
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
              ML predictions work normally! However, analytics and historical logs require a connected MySQL database. 
              To persist data, update your password in <code className="px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 font-mono text-[11px] font-semibold">backend/.env</code> and run <code className="px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 font-mono text-[11px] font-semibold">./venv/bin/python backend/init_db.py</code>.
            </p>
          </div>
        </div>
      )}

      {/* EMPTY STATE HANDLING */}
      {!isLoading && total === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            No predictions yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create your first health prediction to see live population analytics, biomarker distributions, and time-series charts here.
          </p>
          <div className="pt-2">
            <Link
              to="/predict"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Make Prediction</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* PRIMARY KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Predictions"
              value={analytics?.total_predictions}
              subtitle="All evaluated records"
              icon={Users}
              variant="brand"
            />
            <StatCard
              title="Positive (Higher Risk)"
              value={analytics?.positive_predictions}
              subtitle={`${analytics?.positive_percentage || 0}% of cohort`}
              icon={AlertTriangle}
              variant="danger"
              badgeText={`${analytics?.positive_percentage || 0}%`}
            />
            <StatCard
              title="Negative (Lower Risk)"
              value={analytics?.negative_predictions}
              subtitle={`${analytics?.negative_percentage || 0}% of cohort`}
              icon={CheckCircle2}
              variant="success"
              badgeText={`${analytics?.negative_percentage || 0}%`}
            />
            <StatCard
              title="Positive Rate"
              value={`${analytics?.positive_percentage || 0}%`}
              subtitle="Population prevalence"
              icon={TrendingUp}
              variant="warning"
            />
          </div>

          {/* SECONDARY CLINICAL BIOMARKER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Cohort Average Age"
              value={analytics?.average_age ? `${analytics.average_age} yrs` : '—'}
              subtitle="Mean evaluated patient age"
              icon={Activity}
              variant="default"
            />
            <StatCard
              title="Cohort Average BMI"
              value={analytics?.average_bmi ? `${analytics.average_bmi} kg/m²` : '—'}
              subtitle="Mean Body Mass Index"
              icon={Scale}
              variant="default"
            />
            <StatCard
              title="Cohort Average Glucose"
              value={analytics?.average_glucose ? `${analytics.average_glucose} mg/dL` : '—'}
              subtitle="Mean fasting blood glucose"
              icon={Droplet}
              variant="default"
            />
          </div>

          {/* CHARTS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Predictions Timeline */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Predictions Over Time
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daily trajectory of higher risk vs lower risk evaluations
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Last 30 Days
                </span>
              </div>
              <PredictionsTimelineChart data={analytics?.predictions_by_date} />
            </div>

            {/* Distribution Donut */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prediction Distribution
                </h3>
                <p className="text-[11px] text-slate-500">
                  Relative proportion of outcomes
                </p>
              </div>
              <PredictionDistributionChart data={analytics?.prediction_distribution} />
            </div>
          </div>

          {/* CHARTS ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Age Group Breakdown */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Risk by Age Demographics
                </h3>
                <p className="text-[11px] text-slate-500">
                  Prevalence partitioned into four age brackets
                </p>
              </div>
              <PositiveNegativeBarChart data={analytics?.age_distribution} />
            </div>

            {/* Glucose vs BMI Scatter */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Biomarker Correlation: Glucose vs. BMI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sample records with prediction classification coloring
                </p>
              </div>
              <GlucoseScatterChart data={analytics?.glucose_vs_prediction} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
