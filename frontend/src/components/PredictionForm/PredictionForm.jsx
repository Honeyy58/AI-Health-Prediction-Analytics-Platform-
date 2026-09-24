import React, { useState } from 'react';
import { 
  HeartPulse, 
  User, 
  Activity, 
  Cigarette, 
  Scale, 
  Droplet, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  CheckCircle2,
  RefreshCcw,
  Send
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';

const PRESETS = [
  {
    name: 'Low Risk (Healthy)',
    desc: 'Normal BMI & glucose indicators',
    data: {
      gender: 'Female',
      age: '28',
      hypertension: 0,
      heart_disease: 0,
      smoking_history: 'never',
      bmi: '21.5',
      HbA1c_level: '4.8',
      blood_glucose_level: '88'
    }
  },
  {
    name: 'Borderline Profile',
    desc: 'Prediabetes glucose & elevated BMI',
    data: {
      gender: 'Male',
      age: '52',
      hypertension: 0,
      heart_disease: 0,
      smoking_history: 'former',
      bmi: '29.4',
      HbA1c_level: '6.1',
      blood_glucose_level: '138'
    }
  },
  {
    name: 'Higher Risk Profile',
    desc: 'Elevated HbA1c, glucose & hypertension',
    data: {
      gender: 'Male',
      age: '66',
      hypertension: 1,
      heart_disease: 1,
      smoking_history: 'current',
      bmi: '35.2',
      HbA1c_level: '8.2',
      blood_glucose_level: '215'
    }
  }
];

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return NaN;
  return parseFloat(String(val).trim().replace(',', '.'));
};

const PredictionForm = ({ onSubmit, isLoading }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    gender: 'Female',
    age: '',
    hypertension: 0,
    heart_disease: 0,
    smoking_history: 'never',
    bmi: '',
    HbA1c_level: '',
    blood_glucose_level: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    // Age validation
    const ageNum = parseNum(formData.age);
    if (isNaN(ageNum)) {
      errs.age = 'Age is required.';
    } else if (ageNum <= 0) {
      errs.age = 'Age must be greater than 0.';
    } else if (ageNum > 120) {
      errs.age = 'Age must be 120 or less.';
    }

    // BMI validation
    const bmiNum = parseNum(formData.bmi);
    if (isNaN(bmiNum)) {
      errs.bmi = 'BMI is required.';
    } else if (bmiNum < 5) {
      errs.bmi = 'BMI must be at least 5.';
    } else if (bmiNum > 100) {
      errs.bmi = 'BMI must be 100 or less.';
    }

    // HbA1c validation
    const hba1cNum = parseNum(formData.HbA1c_level);
    if (isNaN(hba1cNum)) {
      errs.HbA1c_level = 'HbA1c level is required.';
    } else if (hba1cNum < 1.0) {
      errs.HbA1c_level = 'HbA1c must be at least 1.0%.';
    } else if (hba1cNum > 25.0) {
      errs.HbA1c_level = 'HbA1c must be 25.0% or less.';
    }

    // Blood Glucose validation
    const glucoseNum = parseNum(formData.blood_glucose_level);
    if (isNaN(glucoseNum)) {
      errs.blood_glucose_level = 'Blood glucose is required.';
    } else if (glucoseNum < 20) {
      errs.blood_glucose_level = 'Blood glucose must be at least 20 mg/dL.';
    } else if (glucoseNum > 800) {
      errs.blood_glucose_level = 'Blood glucose must be 800 mg/dL or less.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast(`Please fill in all required health indicators.`, 'warning');
      return false;
    }
    return true;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleApplyPreset = (presetData) => {
    setFormData(presetData);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert values to expected types
    const payload = {
      gender: formData.gender,
      age: parseNum(formData.age),
      hypertension: parseInt(formData.hypertension, 10) || 0,
      heart_disease: parseInt(formData.heart_disease, 10) || 0,
      smoking_history: formData.smoking_history,
      bmi: parseNum(formData.bmi),
      HbA1c_level: parseNum(formData.HbA1c_level),
      hba1c_level: parseNum(formData.HbA1c_level),
      blood_glucose_level: parseNum(formData.blood_glucose_level)
    };

    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      {/* Preset Profiles Bar */}
      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-900 dark:text-brand-200">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Quick Test Profiles (Pre-fill Form)</span>
          </div>
          <span className="text-[11px] text-brand-600 dark:text-brand-400">Click to autofill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p.data)}
              className="text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-sm transition-all group"
            >
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Information */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              1. Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Biological Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Female', 'Male'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleChange('gender', g)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      formData.gender === g
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Age (Years)
                </label>
                <span className="text-[11px] text-slate-400">1 - 120</span>
              </div>
              <input
                type="number"
                step="1"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 45"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                  errors.age ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.age && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.age}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Medical Conditions */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Activity className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              2. Medical Conditions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hypertension */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Hypertension (High Blood Pressure)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'No', val: 0 },
                  { label: 'Yes', val: 1 }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleChange('hypertension', opt.val)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      formData.hypertension === opt.val
                        ? opt.val === 1
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Heart Disease */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Heart Disease History
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'No', val: 0 },
                  { label: 'Yes', val: 1 }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleChange('heart_disease', opt.val)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      formData.heart_disease === opt.val
                        ? opt.val === 1
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Lifestyle & Smoking History */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Cigarette className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              3. Lifestyle & Smoking History
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Smoking Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'never', label: 'Never' },
                { key: 'former', label: 'Former' },
                { key: 'current', label: 'Current' },
                { key: 'not current', label: 'Not Current' },
                { key: 'ever', label: 'Ever' },
                { key: 'No Info', label: 'No Info' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleChange('smoking_history', s.key)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                    formData.smoking_history === s.key
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Clinical Measurements */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Scale className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              4. Clinical Biomarkers & Measurements
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BMI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  BMI (kg/m²)
                </label>
                <span className="text-[10px] text-slate-400">Normal: 18.5 - 24.9</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="10"
                max="80"
                value={formData.bmi}
                onChange={(e) => handleChange('bmi', e.target.value)}
                placeholder="e.g. 26.5"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                  errors.bmi ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.bmi && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.bmi}
                </p>
              )}
            </div>

            {/* HbA1c */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  HbA1c Level (%)
                </label>
                <span className="text-[10px] text-slate-400">Normal: &lt; 5.7%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="20.0"
                value={formData.HbA1c_level}
                onChange={(e) => handleChange('HbA1c_level', e.target.value)}
                placeholder="e.g. 5.6"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                  errors.HbA1c_level ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.HbA1c_level && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.HbA1c_level}
                </p>
              )}
            </div>

            {/* Blood Glucose */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Blood Glucose (mg/dL)
                </label>
                <span className="text-[10px] text-slate-400">Fasting: 70 - 100</span>
              </div>
              <input
                type="number"
                step="1"
                min="40"
                max="600"
                value={formData.blood_glucose_level}
                onChange={(e) => handleChange('blood_glucose_level', e.target.value)}
                placeholder="e.g. 110"
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${
                  errors.blood_glucose_level ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.blood_glucose_level && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.blood_glucose_level}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button & Disclaimer */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-5 h-5 animate-spin" />
                <span>Analyzing health data...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Generate Prediction</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            Protected with input bounds validation • Inference runs on trained Logistic Regression
          </p>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;
