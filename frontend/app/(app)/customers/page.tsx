'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, FormControlLabel, Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';
import type { Customer } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';

const empty: Partial<Customer> = {
  name: '', gstin: '', billing_address: '', billing_state: '', billing_state_code: '',
  shipping_address: '', shipping_state: '', shipping_state_code: '',
  same_as_billing: true, email: '', contact_person: '', mobile: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const data = await api<{ customers: Customer[] }>(`/customers?q=${encodeURIComponent(q)}`);
    setCustomers(data.customers);
  };

  useEffect(() => { load(); }, [q]);

  const openCreate = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (c: Customer) => { setForm(c); setEditingId(c.id); setOpen(true); };

  const save = async () => {
    if (editingId) {
      await api(`/customers/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
    } else {
      await api('/customers', { method: 'POST', body: JSON.stringify(form) });
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Deactivate this customer?')) return;
    await api(`/customers/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Manage billing and shipping details for your clients"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Customer</Button>}
      />
      <TextField size="small" placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} sx={{ mb: 2, minWidth: 280 }} />
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>GSTIN</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.gstin}</TableCell>
                <TableCell>{c.billing_state} ({c.billing_state_code})</TableCell>
                <TableCell>{c.contact_person} {c.mobile}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(c)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(c.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="GSTIN" value={form.gstin || ''} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
          <TextField label="Billing Address" multiline rows={2} value={form.billing_address || ''} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Billing State" value={form.billing_state || ''} onChange={(e) => setForm({ ...form, billing_state: e.target.value })} fullWidth />
            <TextField label="State Code" value={form.billing_state_code || ''} onChange={(e) => setForm({ ...form, billing_state_code: e.target.value })} />
          </Box>
          <FormControlLabel control={<Switch checked={form.same_as_billing !== false} onChange={(e) => setForm({ ...form, same_as_billing: e.target.checked })} />} label="Shipping same as billing" />
          {form.same_as_billing === false && (
            <>
              <TextField label="Shipping Address" multiline rows={2} value={form.shipping_address || ''} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Shipping State" value={form.shipping_state || ''} onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} fullWidth />
                <TextField label="State Code" value={form.shipping_state_code || ''} onChange={(e) => setForm({ ...form, shipping_state_code: e.target.value })} />
              </Box>
            </>
          )}
          <TextField label="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Contact Person" value={form.contact_person || ''} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <TextField label="Mobile" value={form.mobile || ''} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
