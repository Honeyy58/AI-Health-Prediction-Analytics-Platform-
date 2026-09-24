import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Result from './pages/Result';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';
import NotFound from './pages/NotFound';
import { HeartPulse, ShieldCheck, Github, ExternalLink } from 'lucide-react';

function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/result" element={<Predict />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Global Application Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              HealthAI Platform
            </span>
            <span>• Scikit-Learn + FastAPI + MySQL + React</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <Link to="/about" className="hover:text-brand-600 transition">
              Methodology
            </Link>
            <Link to="/history" className="hover:text-brand-600 transition">
              Audit Logs
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-brand-600 transition"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppLayout />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
