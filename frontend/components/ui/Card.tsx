import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'glow' | 'accent' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'surface-card rounded-2xl p-6 shadow-sm',
    glass: 'surface-card rounded-2xl p-6 shadow-sm',
    interactive: 'surface-card-hover rounded-2xl p-6 cursor-pointer',
    glow: 'surface-card rounded-2xl p-6 border-[#007AFF]/30 shadow-[0_1px_3px_rgba(0,122,255,0.08)]',
    accent: 'surface-accent-card rounded-2xl p-6',
    subtle: 'surface-subtle rounded-2xl p-6',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-[#6E6E73] dark:text-[#AEAEB2] mt-0.5 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`space-y-4 ${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mt-5 pt-3.5 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
