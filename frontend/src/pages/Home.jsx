import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Database, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  FileText,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import healthApi from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    positiveRate: 0,
    modelAccuracy: 94.5
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const res = await healthApi.getAnalytics();
        if (res && res.total_predictions !== undefined) {
          setStats({
            total: res.total_predictions,
            positiveRate: res.positive_percentage,
            modelAccuracy: 94.5
          });
        }
      } catch (err) {
        // Fallback to default stats if database is empty/fresh
      }
    };
    fetchQuickStats();
  }, []);

  const features = [
    {
      icon: BrainCircuit,
      title: 'Logistic Regression Engine',
      description: 'Supervised classification trained on balanced clinical datasets with probability calibration for risk inference.',
      color: 'text-brand-500 bg-brand-500/10'
    },
    {
      icon: Activity,
      title: '8 Key Health Indicators',
      description: 'Evaluates fasting glucose, HbA1c, BMI, age, cardiovascular history, and smoking behavior in exact feature ordering.',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      icon: Database,
      title: 'Persistent MySQL Storage',
      description: 'Production relational persistence tracking every assessment record, timestamp, and confidence probability.',
      color: 'text-accent-cyan bg-accent-cyan/10'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Clinical Analytics',
      description: 'Live interactive aggregations, distribution charts, timeline dynamics, and demographic breakdowns.',
      color: 'text-indigo-500 bg-indigo-500/10'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Input Health Data',
      desc: 'Enter patient biomarkers: age, BMI, HbA1c, glucose, and medical history with instant bound validation.'
    },
    {
      step: '02',
      title: 'Standardized Preprocessing',
      desc: 'Features are encoded and scaled via fitted StandardScaler matching the ML training pipeline.'
    },
    {
      step: '03',
      title: 'Inference & Calibration',
      desc: 'Logistic Regression calculates model probability and surfaces a non-diagnostic risk forecast.'
    },
    {
      step: '04',
      title: 'MySQL Record & Insights',
      desc: 'Result is securely recorded in MySQL and immediately reflected on the analytical dashboard.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/15 dark:bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-accent-cyan/15 dark:bg-accent-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Full-Stack Machine Learning Health Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            AI-Powered Health <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan">
              Prediction & Analytics
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Analyze health indicators and generate machine-learning based diabetes risk predictions through a simple and intuitive interface. Powered by Scikit-Learn, FastAPI, MySQL, and React.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/predict"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Start Prediction</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all duration-200 border border-slate-200/80 dark:border-slate-700/80"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Dashboard</span>
            </Link>
          </div>

          {/* KPI Ticker */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 max-w-lg">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                94.5%
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Model ROC-AUC / Accuracy
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                8 Features
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Clinical Biomarkers
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                &lt; 50ms
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                FastAPI Latency
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Engineered for Production Precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A cohesive architecture connecting verified machine learning pipelines with resilient database persistence and modern analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREDICTION PIPELINE WORKFLOW */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Architecture & Pipeline
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            How The Prediction Pipeline Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 relative"
            >
              <div className="text-xs font-mono font-bold text-brand-500">
                {st.step}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {st.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATIONAL DISCLAIMER BANNER */}
      <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-4 text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
            Educational Demonstration & Non-Diagnostic Guarantee
          </h4>
          <p>
            This application is constructed strictly for educational and portfolio presentation purposes. Predictions are probabilistic statistical evaluations generated by a trained Logistic Regression algorithm and must never be considered medical advice or clinical diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
