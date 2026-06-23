'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Select, FormControl, InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';

const empty: Partial<Product> = {
  name: '', product_type: 'physical_item', hsn_sac_code: '', unit: 'Nos',
  rate: 0, gst_percent: 18, category: '', stock_quantity: 0,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [form, setForm] = useState<Partial<Product>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockForm, setStockForm] = useState({ reason: 'manual_correction', quantity_change: 0, notes: '' });

  const load = async () => {
    const data = await api<{ products: Product[] }>('/products');
    setProducts(data.products);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await api(`/products/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
    } else {
      await api('/products', { method: 'POST', body: JSON.stringify(form) });
    }
    setOpen(false);
    load();
  };

  const adjustStock = async () => {
    if (!editingId) return;
    await api(`/products/${editingId}/stock-adjustments`, {
      method: 'POST',
      body: JSON.stringify(stockForm),
    });
    setStockOpen(false);
    load();
  };

  return (
    <>
      <PageHeader
        title="Products / Inventory"
        subtitle="Manage catalog items, rates, GST, and stock levels"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }}>Add Product</Button>}
      />
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>HSN/SAC</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>GST%</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.product_type}</TableCell>
                <TableCell>{p.hsn_sac_code}</TableCell>
                <TableCell>{p.rate}</TableCell>
                <TableCell>{p.gst_percent}</TableCell>
                <TableCell>{p.product_type === 'physical_item' ? p.stock_quantity : '—'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setForm(p); setEditingId(p.id); setOpen(true); }}><EditIcon /></IconButton>
                  {p.product_type === 'physical_item' && (
                    <IconButton onClick={() => { setEditingId(p.id); setStockOpen(true); }}><TuneIcon /></IconButton>
                  )}
                  <IconButton onClick={async () => { if (confirm('Deactivate?')) { await api(`/products/${p.id}`, { method: 'DELETE' }); load(); } }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormControl>
            <InputLabel>Type</InputLabel>
            <Select value={form.product_type || 'physical_item'} label="Type" onChange={(e) => setForm({ ...form, product_type: e.target.value as Product['product_type'] })}>
              <MenuItem value="physical_item">Physical Item</MenuItem>
              <MenuItem value="service">Service</MenuItem>
            </Select>
          </FormControl>
          <TextField label="HSN/SAC" value={form.hsn_sac_code || ''} onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })} />
          <TextField label="Unit" value={form.unit || ''} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <TextField label="Rate" type="number" value={form.rate ?? 0} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
          <TextField label="GST %" type="number" value={form.gst_percent ?? 18} onChange={(e) => setForm({ ...form, gst_percent: Number(e.target.value) })} />
          {form.product_type === 'physical_item' && (
            <TextField label="Stock Quantity" type="number" value={form.stock_quantity ?? 0} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockOpen} onClose={() => setStockOpen(false)}>
        <DialogTitle>Stock Adjustment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 300 }}>
          <FormControl>
            <InputLabel>Reason</InputLabel>
            <Select value={stockForm.reason} label="Reason" onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}>
              <MenuItem value="manual_correction">Manual Correction</MenuItem>
              <MenuItem value="purchase_received">Purchase Received</MenuItem>
              <MenuItem value="damaged">Damaged</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Quantity Change (+/-)" type="number" value={stockForm.quantity_change} onChange={(e) => setStockForm({ ...stockForm, quantity_change: Number(e.target.value) })} />
          <TextField label="Notes" value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={adjustStock}>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
