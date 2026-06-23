'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BuildIcon from '@mui/icons-material/Build';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';

export default function DashboardPage() {
  const [stats, setStats] = useState({ customers: 0, products: 0, invoices: 0, jobs: 0 });

  useEffect(() => {
    Promise.all([
      api<{ customers: unknown[] }>('/customers'),
      api<{ products: unknown[] }>('/products'),
      api<{ invoices: unknown[] }>('/invoices'),
      api<{ jobs: unknown[] }>('/service-jobs'),
    ]).then(([c, p, i, j]) => {
      setStats({
        customers: c.customers.length,
        products: p.products.length,
        invoices: i.invoices.length,
        jobs: j.jobs.length,
      });
    });
  }, []);

  const cards = [
    { label: 'Customers', value: stats.customers, icon: <PeopleIcon />, color: '#1565c0' },
    { label: 'Products', value: stats.products, icon: <InventoryIcon />, color: '#6a1b9a' },
    { label: 'Invoices', value: stats.invoices, icon: <ReceiptIcon />, color: '#2e7d32' },
    { label: 'Service Jobs', value: stats.jobs, icon: <BuildIcon />, color: '#f57c00' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your servicing and invoicing operations"
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </Box>
    </>
  );
}
