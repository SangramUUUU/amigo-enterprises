'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '@/lib/api';
import { useRequireRole } from '@/lib/auth';
import type { AmcContract, Customer } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';
import StatusChip from '@/components/ui/StatusChip';

const empty = {
  contract_number: '', customer_id: '', start_date: '', end_date: '',
  contract_value: 0, visit_frequency: 'yearly', notes: '',
};

export default function AmcContractsPage() {
  const [contracts, setContracts] = useState<AmcContract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const canEdit = useRequireRole('admin', 'super_admin');

  const load = async () => {
    const [c, cust] = await Promise.all([
      api<{ contracts: AmcContract[] }>('/amc-contracts'),
      api<{ customers: Customer[] }>('/customers'),
    ]);
    setContracts(c.contracts);
    setCustomers(cust.customers);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await api(`/amc-contracts/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
    } else {
      await api('/amc-contracts', { method: 'POST', body: JSON.stringify(form) });
    }
    setOpen(false);
    load();
  };

  return (
    <>
      <PageHeader
        title="AMC Contracts"
        subtitle="Track annual maintenance contracts and renewal reminders"
        actions={canEdit ? <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }}>Add Contract</Button> : undefined}
      />
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Contract #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.contract_number}</TableCell>
                <TableCell>{c.customer_name}</TableCell>
                <TableCell>{c.start_date?.slice(0, 10)} – {c.end_date?.slice(0, 10)}</TableCell>
                <TableCell>₹{Number(c.contract_value).toFixed(2)}</TableCell>
                <TableCell><StatusChip status={c.computed_status || 'active'} /></TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <IconButton onClick={() => {
                      setForm({
                        contract_number: c.contract_number,
                        customer_id: c.customer_id,
                        start_date: c.start_date,
                        end_date: c.end_date,
                        contract_value: c.contract_value,
                        visit_frequency: c.visit_frequency,
                        notes: '',
                      });
                      setEditingId(c.id);
                      setOpen(true);
                    }}><EditIcon /></IconButton>
                    <IconButton onClick={async () => { if (confirm('Deactivate?')) { await api(`/amc-contracts/${c.id}`, { method: 'DELETE' }); load(); } }}><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Contract' : 'New AMC Contract'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Contract Number" value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} />
          <FormControl>
            <InputLabel>Customer</InputLabel>
            <Select value={form.customer_id} label="Customer" onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Start Date" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.start_date?.slice(0, 10) || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <TextField label="End Date" type="date" slotProps={{ inputLabel: { shrink: true } }} value={form.end_date?.slice(0, 10) || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <TextField label="Contract Value" type="number" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: Number(e.target.value) })} />
          <FormControl>
            <InputLabel>Visit Frequency</InputLabel>
            <Select value={form.visit_frequency} label="Visit Frequency" onChange={(e) => setForm({ ...form, visit_frequency: e.target.value })}>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="half_yearly">Half Yearly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
