import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, ShieldAlert } from 'lucide-react';
import PredictionForm from '../components/PredictionForm/PredictionForm';
import ResultCard from '../components/ResultCard/ResultCard';
import healthApi from '../services/api';
import { useToast } from '../context/ToastContext';

const Predict = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const { addToast } = useToast();

  const handleFormSubmit = async (payload) => {
    setIsLoading(true);
    try {
      const response = await healthApi.predict(payload);
      setPredictionResult(response);
      setSubmittedData(payload);
      addToast(
        `Assessment complete: ${response.result} risk profile predicted (${response.confidence}% confidence).`,
        response.result === 'Positive' ? 'warning' : 'success'
      );
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast(err.message || 'Failed to generate prediction. Please check inputs and server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      {!predictionResult ? (
        <div className="space-y-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <span>Diagnostic Risk Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Health Assessment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Enter the required health indicators to generate an ML-based prediction. The system verifies input constraints, normalizes biomarkers, and queries the trained Logistic Regression model.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Health Form</span>
          </button>

          <span className="text-xs text-slate-400">
            Completed at {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Dynamic Content: Form vs Result Card */}
      {predictionResult ? (
        <ResultCard
          resultData={predictionResult}
          patientInput={submittedData}
          onReset={handleReset}
        />
      ) : (
        <div className="max-w-3xl mx-auto">
          <PredictionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default Predict;
