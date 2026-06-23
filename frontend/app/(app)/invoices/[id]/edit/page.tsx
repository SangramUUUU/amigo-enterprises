'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, IconButton, MenuItem, Paper, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '@/lib/api';
import type { Customer, Product, Invoice, InvoiceLineItem } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';
import LoadingState from '@/components/ui/LoadingState';

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lines, setLines] = useState<InvoiceLineItem[]>([]);

  useEffect(() => {
    Promise.all([
      api<{ invoice: Invoice }>(`/invoices/${id}`),
      api<{ customers: Customer[] }>('/customers'),
      api<{ products: Product[] }>('/products'),
    ]).then(([invRes, c, p]) => {
      const inv = invRes.invoice;
      if (['paid', 'cancelled'].includes(inv.status)) {
        router.replace(`/invoices/${id}`);
        return;
      }
      setInvoice(inv);
      setCustomerId(inv.customer_id);
      setDueDate(inv.due_date?.slice(0, 10) || '');
      setLines(
        (inv.line_items || []).map((line) => ({
          product_id: line.product_id,
          product_name: line.product_name,
          hsn_sac_code: line.hsn_sac_code,
          unit: line.unit,
          quantity: Number(line.quantity),
          rate: Number(line.rate),
          discount: Number(line.discount),
          gst_percent: Number(line.gst_percent),
        }))
      );
      setCustomers(c.customers);
      setProducts(p.products);
    });
  }, [id, router]);

  const addLine = () => setLines([...lines, { product_name: '', hsn_sac_code: '', unit: 'Nos', quantity: 1, rate: 0, discount: 0, gst_percent: 18 }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const pickProduct = (i: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const updated = [...lines];
    updated[i] = {
      ...updated[i],
      product_id: p.id,
      product_name: p.name,
      hsn_sac_code: p.hsn_sac_code,
      unit: p.unit,
      rate: Number(p.rate),
      gst_percent: Number(p.gst_percent),
    };
    setLines(updated);
  };

  const save = async () => {
    await api(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ customer_id: customerId, due_date: dueDate || null, line_items: lines }),
    });
    router.push(`/invoices/${id}`);
  };

  if (!invoice) return <LoadingState label="Loading invoice..." />;

  return (
    <>
      <PageHeader
        title={`Edit Invoice — ${invoice.invoice_number}`}
        subtitle="Update customer, due date, and line items"
      />
      <Paper sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Customer</InputLabel>
          <Select value={customerId} label="Customer" onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Due Date"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Line Items</Typography>
        <Button startIcon={<AddIcon />} onClick={addLine}>Add Line</Button>
      </Box>
      <DataCard>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>GST%</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Select size="small" displayEmpty value={line.product_id || ''} onChange={(e) => pickProduct(i, e.target.value)} sx={{ minWidth: 180, mr: 1 }}>
                    <MenuItem value="">Manual</MenuItem>
                    {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                  <TextField size="small" value={line.product_name} onChange={(e) => { const u = [...lines]; u[i].product_name = e.target.value; setLines(u); }} />
                </TableCell>
                <TableCell><TextField size="small" type="number" value={line.quantity} onChange={(e) => { const u = [...lines]; u[i].quantity = Number(e.target.value); setLines(u); }} /></TableCell>
                <TableCell><TextField size="small" type="number" value={line.rate} onChange={(e) => { const u = [...lines]; u[i].rate = Number(e.target.value); setLines(u); }} /></TableCell>
                <TableCell><TextField size="small" type="number" value={line.discount} onChange={(e) => { const u = [...lines]; u[i].discount = Number(e.target.value); setLines(u); }} /></TableCell>
                <TableCell><TextField size="small" type="number" value={line.gst_percent} onChange={(e) => { const u = [...lines]; u[i].gst_percent = Number(e.target.value); setLines(u); }} /></TableCell>
                <TableCell><IconButton onClick={() => removeLine(i)}><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataCard>

      <Box sx={{ mt: 2.5, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => router.push(`/invoices/${id}`)}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={!customerId || lines.length === 0}>
          Save Changes
        </Button>
      </Box>
    </>
  );
}
