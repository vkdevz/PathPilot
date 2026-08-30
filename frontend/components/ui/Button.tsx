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
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#007AFF] hover:bg-[#006EDB] text-white border border-transparent active:bg-[#0062C4]',
    secondary:
      'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]',
    outline:
      'bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D2D2D7] dark:border-[#38383A] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]',
    ghost:
      'bg-transparent text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]',
    danger:
      'bg-[#FF3B30] hover:bg-[#E02E24] text-white border border-transparent',
    glow:
      'bg-[#007AFF] hover:bg-[#006EDB] text-white font-semibold border border-transparent shadow-[0_1px_3px_rgba(0,122,255,0.2)]',
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
