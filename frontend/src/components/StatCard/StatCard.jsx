import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badgeText
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80 dark:border-slate-800/80',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
    brand: {
      border: 'border-brand-200 dark:border-brand-800/60',
      iconBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      valueColor: 'text-brand-600 dark:text-brand-400',
    },
    success: {
      border: 'border-emerald-200 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    danger: {
      border: 'border-rose-200 dark:border-rose-800/60',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      border: 'border-amber-200 dark:border-amber-800/60',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border ${currentVariant.border} shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-xl ${currentVariant.iconBg} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-2xl lg:text-3xl font-bold tracking-tight ${currentVariant.valueColor}`}>
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badgeText && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
