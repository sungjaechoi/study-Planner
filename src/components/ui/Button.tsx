'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-indigo-500 to-indigo-600 text-white
    hover:from-indigo-600 hover:to-indigo-700
    shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
    focus:ring-indigo-500/50
  `,
  secondary: `
    bg-stone-100 text-stone-700
    hover:bg-stone-200
    focus:ring-stone-400/50
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 text-white
    hover:from-red-600 hover:to-red-700
    shadow-lg shadow-red-500/25 hover:shadow-red-500/40
    focus:ring-red-500/50
  `,
  ghost: `
    bg-transparent text-stone-600
    hover:bg-stone-100 hover:text-stone-800
    focus:ring-stone-400/50
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-semibold rounded-xl
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          transition-all duration-200 ease-out
          active:scale-[0.98]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
