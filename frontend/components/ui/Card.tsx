import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'glow' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-sm',
    glass: 'surface-card rounded-2xl p-6 shadow-sm',
    interactive: 'surface-card-hover rounded-2xl p-6 cursor-pointer',
    glow: 'surface-card rounded-2xl p-6 border-indigo-500/30 shadow-md shadow-indigo-500/10',
    accent: 'surface-accent-card rounded-2xl p-6',
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
  <h3 className={`text-base font-semibold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-slate-400 mt-0.5 leading-relaxed ${className}`} {...props}>
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
  <div className={`mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
