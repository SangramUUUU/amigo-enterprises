'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Paper, TextField, Typography, Alert, alpha } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import LoadingState from '@/components/ui/LoadingState';

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState('owner@yourcompany.com');
  const [password, setPassword] = useState('ChangeThisImmediately123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 45%, #42a5f5 100%)',
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <LoadingState label="Loading login..." />
        </Paper>
      </Box>
    );
  }
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 45%, #42a5f5 100%)',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        }}
        elevation={0}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#1565c0', 0.1),
              color: 'primary.main',
            }}
          >
            <ReceiptLongIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Amigo Enterprises
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ESP Servicing & Invoicing ERP
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to manage customers, inventory, invoices, AMC contracts, and service jobs.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2.5, py: 1.2 }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
          <Button fullWidth component={Link} href="/" variant="text" sx={{ mt: 1 }}>
            Back to Home
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
