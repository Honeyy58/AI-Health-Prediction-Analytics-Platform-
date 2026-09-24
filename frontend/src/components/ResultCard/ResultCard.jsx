import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Clock, 
  LayoutDashboard, 
  HeartPulse, 
  ShieldAlert, 
  User, 
  Scale, 
  Activity, 
  Droplet,
  FileText
} from 'lucide-react';

const ResultCard = ({ resultData, patientInput, onReset }) => {
  if (!resultData) return null;

  const isPositive = resultData.result === 'Positive' || resultData.prediction === 1;
  const confidence = resultData.confidence || 0;

  // Semantic color schemes
  // Green for Negative (lower risk), Red/Rose for Positive (higher risk)
  const theme = isPositive
    ? {
        badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800',
        gradient: 'from-rose-500/10 via-transparent to-transparent',
        accentColor: '#f43f5e',
        title: 'Higher Predicted Risk',
        statusText: 'POSITIVE',
        icon: AlertTriangle,
      }
    : {
        badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
        gradient: 'from-emerald-500/10 via-transparent to-transparent',
        accentColor: '#10b981',
        title: 'Lower Predicted Risk',
        statusText: 'NEGATIVE',
        icon: CheckCircle2,
      };

  const Icon = theme.icon;

  // Circumference for radial progress ring (radius = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Prediction Showcase Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl bg-gradient-to-b ${theme.gradient}`}>
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Assessment Summary Report</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Machine Learning Prediction Result
            </h2>
          </div>

          {resultData.prediction_id && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Record ID: <span className="font-bold text-slate-900 dark:text-white">#{resultData.prediction_id}</span>
            </div>
          )}
        </div>

        {/* Center Grid: Ring Chart & Status Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8">
          
          {/* Circular Progress Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-800"
                />
                {/* Foreground Animated Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={theme.accentColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Gauge Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {confidence}%
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Confidence
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
              Calibrated model probability
            </p>
          </div>

          {/* Status & Non-Diagnostic Explanation */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeBg}`}>
                <Icon className="w-4 h-4" />
                {theme.statusText}
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {theme.title}
              </span>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {resultData.message}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Inference Specification:
              </div>
              <p>
                Calculated by Logistic Regression using standardized patient markers (BMI, HbA1c, fasting glucose, lifestyle, and cardiovascular indicators).
              </p>
            </div>
          </div>
        </div>

        {/* Patient Indicators Summary */}
        {patientInput && (
          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Patient Assessment Biomarkers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-[11px] text-slate-500">Demographics</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientInput.gender}, {patientInput.age}y
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-[11px] text-slate-500">BMI</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientInput.bmi} kg/m²
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-[11px] text-slate-500">HbA1c Level</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientInput.HbA1c_level || patientInput.hba1c_level}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-[11px] text-slate-500">Blood Glucose</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientInput.blood_glucose_level} mg/dL
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Disclaimer Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <span className="font-semibold block">Educational & Informational Disclaimer:</span>
            <span>
              This prediction is generated by a machine learning model for educational and informational purposes only. It is not a medical diagnosis. Consult a qualified healthcare professional for medical advice, definitive diagnostic testing, or clinical care.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <HeartPulse className="w-4 h-4" />
            <span>New Prediction</span>
          </button>

          <div className="flex items-center space-x-2">
            <Link
              to="/history"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>View History</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;
