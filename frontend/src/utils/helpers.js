export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getPlanStatus(plan) {
  const start = new Date(plan.planStart);
  const end = new Date(plan.planEnd);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'pending';

  if (end < now) return 'completed';
  if (start > now) return 'upcoming';
  return 'pending';
}
