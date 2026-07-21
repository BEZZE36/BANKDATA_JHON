'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  paramName: string;
  options?: Option[];
  defaultValue: string;
  type?: 'select' | 'date' | 'number' | 'text';
  className?: string;
  placeholder?: string;
}

export default function FilterDropdown({
  paramName,
  options = [],
  defaultValue,
  type = 'select',
  className = 'form-input w-auto',
  placeholder = 'Semua',
}: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value) {
      current.set(paramName, value);
    } else {
      current.delete(paramName);
    }
    
    // Reset page to 1 on filter change
    current.delete('page');

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`);
  };

  if (type === 'date' || type === 'number' || type === 'text') {
    return (
      <input
        type={type}
        defaultValue={defaultValue}
        className={className}
        onChange={handleChange}
        placeholder={placeholder}
      />
    );
  }

  return (
    <select defaultValue={defaultValue} className={className} onChange={handleChange}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
