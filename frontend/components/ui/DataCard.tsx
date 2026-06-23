'use client';

import { Paper, TableContainer } from '@mui/material';

export default function DataCard({ children }: { children: React.ReactNode }) {
  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <TableContainer>{children}</TableContainer>
    </Paper>
  );
}
