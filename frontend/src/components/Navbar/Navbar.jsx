import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ShieldCheck, 
  Cpu,
  LayoutDashboard,
  Clock,
  Info,
  HeartPulse
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import healthApi from '../../services/api';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'degraded' | 'offline' | 'checking'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await healthApi.checkHealth();
        if (isMounted) {
          setBackendStatus(res.ml_service === 'ready' ? 'online' : 'degraded');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Predict', path: '/predict', icon: HeartPulse },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleMobileSidebar?.()}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Health<span className="text-brand-500">AI</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    ML
                  </span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                  Prediction & Analytics Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200/60 dark:border-brand-800/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: System Health & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* Backend ML Status indicator */}
            <div 
              title={
                backendStatus === 'online'
                  ? 'FastAPI & ML Model Operational'
                  : backendStatus === 'degraded'
                  ? 'FastAPI running (MySQL initializing or pending)'
                  : 'Backend Server Offline'
              }
              className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            >
              <span className="relative flex h-2 w-2">
                {backendStatus === 'online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    backendStatus === 'online'
                      ? 'bg-emerald-500'
                      : backendStatus === 'degraded'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                {backendStatus === 'online'
                  ? 'ML Active'
                  : backendStatus === 'degraded'
                  ? 'Degraded'
                  : 'Offline'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Action CTA Button */}
            <Link
              to="/predict"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-200"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
