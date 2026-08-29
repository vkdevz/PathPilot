import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/30 hover:shadow-md hover:shadow-indigo-600/20',
    secondary: 'bg-slate-900 hover:bg-slate-800/90 text-slate-200 border border-slate-750 hover:border-slate-600',
    outline: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-750 hover:border-slate-600',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/30 shadow-sm hover:shadow-rose-600/20',
    glow: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 border border-indigo-400/40 hover:scale-[1.01]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
};
