'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, alpha } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '@/lib/api';
import type { OrgSettings } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Button variant="outlined" size="small" component="label">
          Upload
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden onChange={handleFile} />
        </Button>
        {value && (
          <Button color="error" size="small" onClick={() => onChange('')}>
            Remove
          </Button>
        )}
      </Box>
      {value ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#1565c0', 0.04), borderRadius: 1, p: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} style={{ maxHeight: 88, maxWidth: '100%', objectFit: 'contain' }} />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 88, display: 'grid', placeItems: 'center', bgcolor: alpha('#000', 0.03), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">No image uploaded</Typography>
        </Box>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        PNG/JPG, max 2 MB
      </Typography>
    </Box>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
      {children}
    </Paper>
  );
}

export default function OrgSettingsPage() {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [reminderDays, setReminderDays] = useState('60,15');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ settings: OrgSettings }>('/org-settings').then((d) => {
      setSettings(d.settings);
      const days = Array.isArray(d.settings.amc_reminder_days)
        ? d.settings.amc_reminder_days
        : JSON.parse(String(d.settings.amc_reminder_days || '[60,15]'));
      setReminderDays(days.join(','));
    });
  }, []);

  const save = async () => {
    if (!settings) return;
    const payload = {
      ...settings,
      amc_reminder_days: reminderDays.split(',').map((d) => Number(d.trim())).filter(Boolean),
    };
    const data = await api<{ settings: OrgSettings }>('/org-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setSettings(data.settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <LoadingState label="Loading settings..." />;

  const set = (key: keyof OrgSettings, value: string | number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <PageHeader
        title="Organization Settings"
        subtitle="Company profile, invoice branding, and defaults"
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {saved && <Typography color="success.main" sx={{ fontWeight: 600 }}>Saved!</Typography>}
            <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>
              Save Settings
            </Button>
          </Box>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
          gap: 2,
          flexGrow: 1,
          alignContent: 'start',
        }}
      >
        <SectionCard title="Company Details">
          <TextField
            label="Company Name"
            fullWidth
            size="small"
            value={settings.company_name ?? ''}
            onChange={(e) => set('company_name', e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Address"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={settings.address_line ?? ''}
            onChange={(e) => set('address_line', e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 1.5, mb: 1.5 }}>
            <TextField
              label="State"
              fullWidth
              size="small"
              value={settings.state ?? ''}
              onChange={(e) => set('state', e.target.value)}
            />
            <TextField
              label="Code"
              fullWidth
              size="small"
              value={settings.state_code ?? ''}
              onChange={(e) => set('state_code', e.target.value)}
            />
          </Box>
          <TextField
            label="GSTIN"
            fullWidth
            size="small"
            value={settings.gstin ?? ''}
            onChange={(e) => set('gstin', e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={settings.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
            />
            <TextField
              label="Phone"
              fullWidth
              size="small"
              value={settings.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
            />
          </Box>
          <TextField
            label="Bank Details"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={settings.bank_details ?? ''}
            onChange={(e) => set('bank_details', e.target.value)}
          />
        </SectionCard>

        <SectionCard title="Invoice Branding">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
            <ImageUploadField
              label="Company Logo"
              value={settings.logo_url}
              onChange={(dataUrl) => setSettings({ ...settings, logo_url: dataUrl })}
            />
            <ImageUploadField
              label="Signature / Stamp"
              value={settings.signature_url}
              onChange={(dataUrl) => setSettings({ ...settings, signature_url: dataUrl })}
            />
          </Box>
          <TextField
            label="Invoice Number Prefix (e.g. AETX)"
            fullWidth
            size="small"
            value={settings.invoice_number_prefix ?? ''}
            onChange={(e) => set('invoice_number_prefix', e.target.value)}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Numbers: PREFIX-DATE-SEQ (e.g. AETX-23-06-2026-01). Files: PREFIX_DATE_CUSTOMER.pdf (e.g. AETX_23-06-2026_Test Sugar Plant.pdf)
          </Typography>
          <TextField
            label="Default Invoice Terms & Conditions"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={settings.invoice_terms ?? ''}
            onChange={(e) => set('invoice_terms', e.target.value)}
          />
        </SectionCard>

        <SectionCard title="Other Settings">
          <TextField
            label="AMC Reminder Days (comma-separated)"
            fullWidth
            size="small"
            value={reminderDays}
            onChange={(e) => setReminderDays(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Default Low Stock Threshold"
            type="number"
            fullWidth
            size="small"
            value={settings.default_low_stock_threshold}
            onChange={(e) => set('default_low_stock_threshold', Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              mt: 'auto',
              p: 2,
              borderRadius: 2,
              bgcolor: alpha('#1565c0', 0.06),
              border: '1px solid',
              borderColor: alpha('#1565c0', 0.15),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>
              Invoice export preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logo appears centered above the company name. Signature/stamp appears in the footer signatory block on PDF and DOC exports.
            </Typography>
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}
