import type { BadgeVariant } from '@/components/ui/Badge';

/**
 * Maps a status string to a semantic Badge variant.
 * Covers lease, payment, and maintenance request statuses.
 */
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();

  if (['active', 'paid', 'resolved', 'approved', 'completed'].includes(s)) return 'success';
  if (['pending', 'open', 'in_progress', 'in-progress', 'inprogress', 'under_review'].includes(s)) return 'warning';
  if (['overdue', 'rejected', 'failed', 'expired', 'cancelled', 'canceled'].includes(s)) return 'danger';
  if (['draft', 'inactive', 'closed'].includes(s)) return 'neutral';
  if (['info', 'new'].includes(s)) return 'info';

  return 'default';
}
