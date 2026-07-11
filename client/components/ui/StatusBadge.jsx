'use client';
import Badge from './Badge';

const STATUS_TONE = {
  pending:    'warning',
  processing: 'brand',
  shipped:    'brand',
  delivered:  'success',
  cancelled:  'danger',
  active:     'success',
  inactive:   'neutral',
};

export default function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || 'neutral'}>{status}</Badge>;
}
