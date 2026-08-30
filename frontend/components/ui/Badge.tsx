import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
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

  const variantStyles: Record<string, string> = {
    indigo: 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#64D2FF] border border-[#007AFF]/20',
    primary: 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#64D2FF] border border-[#007AFF]/20',
    cyan: 'bg-[#EEF9FF] dark:bg-[#5AC8FA]/15 text-[#007AFF] dark:text-[#64D2FF] border border-[#5AC8FA]/20',
    info: 'bg-[#EEF9FF] dark:bg-[#5AC8FA]/15 text-[#007AFF] dark:text-[#64D2FF] border border-[#5AC8FA]/20',
    emerald: 'bg-[#EAF8EE] dark:bg-[#30D158]/15 text-[#34C759] dark:text-[#30D158] border border-[#34C759]/20',
    success: 'bg-[#EAF8EE] dark:bg-[#30D158]/15 text-[#34C759] dark:text-[#30D158] border border-[#34C759]/20',
    amber: 'bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 text-[#FF9F0A] dark:text-[#FFD60A] border border-[#FF9F0A]/20',
    warning: 'bg-[#FFF4E0] dark:bg-[#FF9F0A]/15 text-[#FF9F0A] dark:text-[#FFD60A] border border-[#FF9F0A]/20',
    rose: 'bg-[#FFF0EF] dark:bg-[#FF453A]/15 text-[#FF3B30] dark:text-[#FF453A] border border-[#FF3B30]/20',
    danger: 'bg-[#FFF0EF] dark:bg-[#FF453A]/15 text-[#FF3B30] dark:text-[#FF453A] border border-[#FF3B30]/20',
    slate: 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#AEAEB2] border border-[#D2D2D7] dark:border-[#38383A]',
    violet: 'bg-[#EAF3FF] dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#64D2FF] border border-[#007AFF]/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md select-none ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.indigo} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
