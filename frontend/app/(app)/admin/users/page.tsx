'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';

export default function UsersAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => api<{ users: User[] }>('/users').then((d) => setUsers(d.users));
  useEffect(() => { load(); }, []);

  const roles = user?.role === 'super_admin'
    ? ['employee', 'admin', 'super_admin']
    : ['employee'];

  const save = async () => {
    if (editingId) {
      const body: Record<string, string> = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      if (user?.role === 'super_admin') body.role = form.role;
      await api(`/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
    } else {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
    }
    setOpen(false);
    load();
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Control access for admins and field employees"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ name: '', email: '', password: '', role: 'employee' }); setEditingId(null); setOpen(true); }}>Add User</Button>}
      />
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip size="small" label={u.role.replace('_', ' ')} color={u.role === 'super_admin' ? 'primary' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setEditingId(u.id); setOpen(true); }}><EditIcon /></IconButton>
                  <IconButton onClick={async () => { if (confirm('Deactivate?')) { await api(`/users/${u.id}`, { method: 'DELETE' }); load(); } }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 360 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label={editingId ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FormControl>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
