import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'sm',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    slate: 'bg-slate-850 text-slate-400 border border-slate-750',
    violet: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
