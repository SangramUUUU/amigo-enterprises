'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { api } from '@/lib/api';
import type { ServiceJob, Customer, User } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';
import StatusChip from '@/components/ui/StatusChip';

const empty = {
  customer_id: '', site_location: '', job_type: 'maintenance',
  scheduled_date: '', description: '', assigned_to: '',
  line_items: [{ description: '', quantity: 1, rate: 0 }],
};

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const [j, c] = await Promise.all([
      api<{ jobs: ServiceJob[] }>('/service-jobs'),
      api<{ customers: Customer[] }>('/customers'),
    ]);
    setJobs(j.jobs);
    setCustomers(c.customers);
    try {
      const u = await api<{ users: User[] }>('/users');
      setEmployees(u.users.filter((x) => x.role === 'employee' || x.role === 'admin'));
    } catch { /* employees may not have user list access */ }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await api(`/service-jobs/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
    } else {
      await api('/service-jobs', { method: 'POST', body: JSON.stringify(form) });
    }
    setOpen(false);
    load();
  };

  const complete = async (id: string) => {
    await api(`/service-jobs/${id}/complete`, { method: 'POST', body: JSON.stringify({}) });
    load();
  };

  const generateInvoice = async (id: string) => {
    const data = await api<{ job: ServiceJob }>(`/service-jobs/${id}/generate-invoice`, { method: 'POST' });
    if (data.job.generated_invoice_id) {
      window.location.href = `/invoices/${data.job.generated_invoice_id}`;
    }
  };

  return (
    <>
      <PageHeader
        title="Service Jobs"
        subtitle="Schedule field work and generate invoices from completed jobs"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }}>New Job</Button>}
      />
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Job #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell>{j.job_number}</TableCell>
                <TableCell>{j.customer_name}</TableCell>
                <TableCell>{j.job_type}</TableCell>
                <TableCell>{j.scheduled_date?.slice(0, 10)}</TableCell>
                <TableCell><StatusChip status={j.status} /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setForm({ ...empty, ...j, customer_id: j.customer_id, line_items: j.line_items || empty.line_items }); setEditingId(j.id); setOpen(true); }}><EditIcon /></IconButton>
                  {j.status !== 'completed' && (
                    <IconButton title="Mark Completed" onClick={() => complete(j.id)}><CheckIcon /></IconButton>
                  )}
                  {j.status === 'completed' && !j.generated_invoice_id && (
                    <IconButton title="Generate Invoice" onClick={() => generateInvoice(j.id)}><ReceiptIcon /></IconButton>
                  )}
                  {j.generated_invoice_id && (
                    <Button size="small" component={Link} href={`/invoices/${j.generated_invoice_id}`}>Invoice</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Job' : 'New Service Job'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl>
            <InputLabel>Customer</InputLabel>
            <Select value={form.customer_id} label="Customer" onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Site Location" value={form.site_location} onChange={(e) => setForm({ ...form, site_location: e.target.value })} />
          <FormControl>
            <InputLabel>Job Type</InputLabel>
            <Select value={form.job_type} label="Job Type" onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
              <MenuItem value="installation">Installation</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="repair">Repair</MenuItem>
              <MenuItem value="amc_visit">AMC Visit</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Scheduled Date" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.scheduled_date?.slice(0, 10) || ''} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
          <TextField label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
