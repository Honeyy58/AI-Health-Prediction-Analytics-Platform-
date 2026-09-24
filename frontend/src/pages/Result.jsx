import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import ResultCard from '../components/ResultCard/ResultCard';
import healthApi from '../services/api';

const Result = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchRecord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await healthApi.getPredictionById(id);
        setRecord(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve prediction record.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Retrieving prediction result...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Prediction Not Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || 'No prediction record ID was provided or the record has been deleted.'}
        </p>
        <Link
          to="/predict"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition"
        >
          <span>Run New Assessment</span>
        </Link>
      </div>
    );
  }

  const resultFormatted = {
    prediction_id: record.id,
    prediction: record.prediction === 'Positive' ? 1 : 0,
    result: record.prediction,
    confidence: record.confidence,
    message:
      record.prediction === 'Positive'
        ? 'The model predicts a higher likelihood of diabetes.'
        : 'The model predicts a lower likelihood of diabetes.',
    created_at: record.created_at
  };

  return (
    <div className="space-y-6 pb-12">
      <Link
        to="/history"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Prediction History</span>
      </Link>

      <ResultCard
        resultData={resultFormatted}
        patientInput={record}
        onReset={() => window.location.href = '/predict'}
      />
    </div>
  );
};

export default Result;
