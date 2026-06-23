'use client';

import { Chip } from '@mui/material';

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  sent: 'primary',
  partially_paid: 'warning',
  paid: 'success',
  overdue: 'error',
  cancelled: 'error',
  active: 'success',
  expiring_soon: 'warning',
  expired: 'error',
  open: 'info',
  in_progress: 'warning',
  completed: 'success',
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const label = status.replace(/_/g, ' ');
  return (
    <Chip
      size={size}
      label={label}
      color={statusColor[status] || 'default'}
      sx={{ textTransform: 'capitalize' }}
    />
  );
}
