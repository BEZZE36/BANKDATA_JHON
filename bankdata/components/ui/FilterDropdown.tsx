'use client';

import { useRouter, usePathname } from 'next/navigation';

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    // Baca URL params saat ini dari window.location tanpa useSearchParams
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set(paramName, value);
    } else {
      url.searchParams.delete(paramName);
    }

    // Reset page to 1 on filter change
    url.searchParams.delete('page');

    router.push(`${pathname}?${url.searchParams.toString()}`);
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
