'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface LogFilterSelectProps {
  currentValue: string;
  modulList: string[];
}

export default function LogFilterSelect({ currentValue, modulList }: LogFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('log_name', e.target.value);
    } else {
      params.delete('log_name');
    }
    params.delete('page');
    router.push(`/log-aktivitas?${params.toString()}`);
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
