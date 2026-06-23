'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Button, FormControl, IconButton, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { api } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import type { Invoice } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';
import StatusChip from '@/components/ui/StatusChip';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const isAdmin = useRequireRole('admin', 'super_admin');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (appliedSearch.trim()) params.set('q', appliedSearch.trim());
    if (status) params.set('status', status);
    const query = params.toString();
    api<{ invoices: Invoice[] }>(`/invoices${query ? `?${query}` : ''}`).then((d) => setInvoices(d.invoices));
  }, [appliedSearch, status]);

  useEffect(() => { load(); }, [load]);

  const applyFilter = () => setAppliedSearch(search);

  const deleteInvoice = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete draft invoice ${inv.invoice_number}? This cannot be undone.`)) return;
    await api(`/invoices/${inv.id}`, { method: 'DELETE' });
    load();
  };

  const canEdit = (inv: Invoice) => isAdmin && !['paid', 'cancelled'].includes(inv.status);
  const canDelete = (inv: Invoice) => isAdmin && inv.status === 'draft';

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Create, preview, and download GST tax invoices"
        actions={
          <Button variant="contained" component={Link} href="/invoices/new" startIcon={<AddIcon />}>
            Create Invoice
          </Button>
        }
      />
      <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            label="Search invoice or customer"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
            sx={{ minWidth: 240, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value || 'all'} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={applyFilter}>
            Filter
          </Button>
          {(appliedSearch || status) && (
            <Button
              variant="text"
              onClick={() => { setSearch(''); setAppliedSearch(''); setStatus(''); }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Paper>
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Tax Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No invoices match your filters.
                </TableCell>
              </TableRow>
            ) : invoices.map((inv) => (
              <TableRow
                key={inv.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/invoices/${inv.id}`)}
              >
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{inv.invoice_number}</TableCell>
                <TableCell>{inv.customer_name}</TableCell>
                <TableCell>{inv.invoice_date?.slice(0, 10)}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{inv.tax_type.replace('_', ' ')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>₹{Number(inv.final_amount).toFixed(2)}</TableCell>
                <TableCell><StatusChip status={inv.status} /></TableCell>
                {isAdmin && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {canEdit(inv) && (
                      <IconButton
                        size="small"
                        title="Edit invoice"
                        onClick={() => router.push(`/invoices/${inv.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete(inv) && (
                      <IconButton
                        size="small"
                        title="Delete draft"
                        color="error"
                        onClick={(e) => deleteInvoice(inv, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>
    </>
  );
}
