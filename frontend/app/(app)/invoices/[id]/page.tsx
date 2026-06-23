'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, alpha, Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsIcon from '@mui/icons-material/Payments';
import { api, downloadFile, previewPdf } from '@/lib/api';
import { buildInvoiceExportFilename, prefixFromInvoiceNumber } from '@/lib/invoiceExport';
import { useRequireRole } from '@/lib/auth';
import type { Invoice } from '@/lib/types';
import StatusChip from '@/components/ui/StatusChip';
import LoadingState from '@/components/ui/LoadingState';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [payment, setPayment] = useState({ amount: 0, payment_mode: 'cash', reference_no: '' });
  const isAdmin = useRequireRole('admin', 'super_admin');

  const load = () => api<{ invoice: Invoice }>(`/invoices/${id}`).then((d) => setInvoice(d.invoice));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!invoice) return <LoadingState label="Loading invoice..." />;

  const exportFile = {
    prefix: prefixFromInvoiceNumber(invoice.invoice_number),
    invoiceDate: invoice.invoice_date,
    customerName: invoice.customer_name,
  };
  const pdfFilename = buildInvoiceExportFilename({ ...exportFile, extension: 'pdf' });
  const docFilename = buildInvoiceExportFilename({ ...exportFile, extension: 'docx' });

  const openPreview = async () => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = await previewPdf(`/invoices/${id}/pdf`);
      setPreviewUrl(url);
    } catch {
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const finalize = async () => {
    await api(`/invoices/${id}/finalize`, { method: 'POST' });
    load();
  };

  const addPayment = async () => {
    await api(`/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(payment) });
    setPaymentOpen(false);
    load();
  };

  const deleteInvoice = async () => {
    if (!confirm(`Delete draft invoice ${invoice.invoice_number}? This cannot be undone.`)) return;
    await api(`/invoices/${id}`, { method: 'DELETE' });
    router.push('/invoices');
  };

  const canEdit = isAdmin && !['paid', 'cancelled'].includes(invoice.status);
  const canDelete = isAdmin && invoice.status === 'draft';

  return (
    <>
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Tax Invoice</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {invoice.invoice_number}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <StatusChip status={invoice.status} size="medium" />
              <Typography variant="body2" color="text.secondary">
                {invoice.customer_name} · {invoice.tax_type.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={openPreview}>
              Preview PDF
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadFile(`/invoices/${id}/pdf`, pdfFilename)}>
              Download PDF
            </Button>
            <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={() => downloadFile(`/invoices/${id}/doc`, docFilename)}>
              Download DOC
            </Button>
            <Button variant="outlined" startIcon={<EmailIcon />} onClick={() => downloadFile(`/invoices/${id}/pdf-for-email`, pdfFilename)}>
              Download for Email
            </Button>
            {isAdmin && invoice.status === 'draft' && (
              <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={finalize}>
                Finalize
              </Button>
            )}
            {isAdmin && ['sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
              <Button variant="contained" color="secondary" startIcon={<PaymentsIcon />} onClick={() => setPaymentOpen(true)}>
                Record Payment
              </Button>
            )}
            {canEdit && (
              <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => router.push(`/invoices/${id}/edit`)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={deleteInvoice}>
                Delete
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Export filename: {pdfFilename}
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Invoice Amount', value: `₹${Number(invoice.final_amount).toFixed(2)}` },
          { label: 'Amount Paid', value: `₹${Number(invoice.amount_paid).toFixed(2)}` },
          { label: 'Balance Due', value: `₹${Number(invoice.balance_due).toFixed(2)}` },
        ].map((item) => (
          <Paper key={item.label} sx={{ p: 2, bgcolor: alpha('#1565c0', 0.04), border: '1px solid', borderColor: alpha('#1565c0', 0.12) }}>
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{item.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: alpha('#1565c0', 0.06) }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Line Items</Typography>
        </Box>
        <Divider />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>HSN</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Taxable</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(invoice.line_items || []).map((line) => (
              <TableRow key={line.id} hover>
                <TableCell>{line.product_name}</TableCell>
                <TableCell>{line.hsn_sac_code}</TableCell>
                <TableCell align="right">{line.quantity}</TableCell>
                <TableCell align="right">{line.rate}</TableCell>
                <TableCell align="right">{line.taxable_value}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{line.line_total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={previewOpen} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Preview — {invoice.invoice_number}</DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewLoading ? (
            <CircularProgress />
          ) : previewUrl ? (
            <Box
              component="iframe"
              src={previewUrl}
              title="Invoice PDF preview"
              sx={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => downloadFile(`/invoices/${id}/pdf`, pdfFilename)}>Download PDF</Button>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 320 }}>
          <TextField label="Amount" type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })} />
          <TextField label="Mode" value={payment.payment_mode} onChange={(e) => setPayment({ ...payment, payment_mode: e.target.value })} />
          <TextField label="Reference No" value={payment.reference_no} onChange={(e) => setPayment({ ...payment, reference_no: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addPayment}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
