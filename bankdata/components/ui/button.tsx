'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'default';
  loading?: boolean;
  href?: string;
  children?: React.ReactNode;
}

function Button({
  variant = 'primary',
  size,
  loading = false,
  href,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    default: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }[variant] ?? 'btn-primary';

  const sizeClass = size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-5 py-2.5' : '';

  const cls = cn(variantClass, sizeClass, className);

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export { Button };
export default Button;
