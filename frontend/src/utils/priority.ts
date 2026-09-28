export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityVisualConfig {
  level: PriorityLevel;
  label: string;
  badgeClass: string;
  borderAccent: string;
  textClass: string;
  bgClass: string;
  dotColor: string;
}

export const PRIORITY_THRESHOLDS = {
  HIGH: 8.0,
  MEDIUM: 6.5,
} as const;

export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= PRIORITY_THRESHOLDS.HIGH) {
    return 'HIGH';
  }
  if (score >= PRIORITY_THRESHOLDS.MEDIUM) {
    return 'MEDIUM';
  }
  return 'LOW';
}

export function getPriorityConfig(score: number): PriorityVisualConfig {
  const level = getPriorityLevel(score);

  switch (level) {
    case 'HIGH':
      return {
        level: 'HIGH',
        label: 'HIGH PRIORITY',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        borderAccent: 'border-l-4 border-l-red-600 border-slate-200',
        textClass: 'text-red-700',
        bgClass: 'bg-red-50',
        dotColor: 'bg-red-600',
      };
    case 'MEDIUM':
      return {
        level: 'MEDIUM',
        label: 'MEDIUM PRIORITY',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        borderAccent: 'border-l-4 border-l-amber-500 border-slate-200',
        textClass: 'text-amber-700',
        bgClass: 'bg-amber-50',
        dotColor: 'bg-amber-500',
      };
    case 'LOW':
    default:
      return {
        level: 'LOW',
        label: 'LOW PRIORITY',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        borderAccent: 'border-l-4 border-l-emerald-600 border-slate-200',
        textClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50',
        dotColor: 'bg-emerald-600',
      };
  }
}
