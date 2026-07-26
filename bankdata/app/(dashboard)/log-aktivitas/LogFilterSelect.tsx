'use client';

import { useRouter, usePathname } from 'next/navigation';

interface LogFilterSelectProps {
  currentValue: string;
  modulList: string[];
}

export default function LogFilterSelect({ currentValue, modulList }: LogFilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href);
    if (e.target.value) {
      url.searchParams.set('log_name', e.target.value);
    } else {
      url.searchParams.delete('log_name');
    }
    url.searchParams.delete('page');
    router.push(`${pathname}?${url.searchParams.toString()}`);
  }

  return (
    <select
      defaultValue={currentValue}
      className="form-input w-auto"
      onChange={handleChange}
    >
      <option value="">Semua Modul</option>
      {modulList.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  );
}
