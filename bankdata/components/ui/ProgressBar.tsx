import { cn } from '@/lib/utils';
import { warnaProgressBar } from '@/lib/utils';

interface ProgressBarProps {
  persen: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({ persen, showLabel = true, size = 'md', className }: ProgressBarProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const clampedPersen = Math.min(Math.max(persen, 0), 100);
  const color = warnaProgressBar(clampedPersen);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Capaian</span>
          <span className={cn('text-xs font-semibold', clampedPersen >= 90 ? 'text-emerald-600' : clampedPersen >= 60 ? 'text-blue-600' : 'text-slate-700')}>
            {persen.toFixed(1)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out', heights[size], color)}
          style={{ width: `${clampedPersen}%` }}
          role="progressbar"
          aria-valuenow={clampedPersen}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
