'use client';

import { Paper, Typography, Box, alpha } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = '#1565c0' }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha(color, 0.15),
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, #fff 60%)`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(color, 0.12),
          color,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}
