'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface SearchBoxProps {
  placeholder?: string;
  paramName?: string;
  className?: string;
}

export default function SearchBox({ placeholder = 'Cari...', paramName = 'q', className }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const val = e.target.value;
      if (val) {
        params.set(paramName, val);
      } else {
        params.delete(paramName);
      }
      params.delete('page'); // reset ke halaman 1 saat search
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, paramName],
  );

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="search"
        defaultValue={searchParams.get(paramName) ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input pl-9 pr-4 py-2 w-full sm:w-64"
        aria-label={placeholder}
      />
    </div>
  );
}
