'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar, Avatar, Box, Chip, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Button, Divider, alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth, useRequireRole } from '@/lib/auth';
import NotificationBell from './NotificationBell';
import LoadingState from './ui/LoadingState';

const drawerWidth = 260;

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/customers', label: 'Customers', icon: <PeopleIcon /> },
  { href: '/products', label: 'Products', icon: <InventoryIcon /> },
  { href: '/invoices', label: 'Invoices', icon: <ReceiptIcon /> },
  { href: '/amc-contracts', label: 'AMC Contracts', icon: <HandshakeIcon /> },
  { href: '/service-jobs', label: 'Service Jobs', icon: <BuildIcon /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const isAdmin = useRequireRole('admin', 'super_admin');

  if (loading || !user) {
    return <LoadingState label="Preparing your workspace..." />;
  }

  const navButton = (href: string, label: string, icon: React.ReactNode) => {
    const selected = pathname.startsWith(href);
    return (
      <ListItemButton
        key={href}
        component={Link}
        href={href}
        selected={selected}
        onClick={() => setMobileOpen(false)}
        sx={{
          mx: 1,
          mb: 0.5,
          borderRadius: 2,
          '&.Mui-selected': {
            bgcolor: alpha('#1565c0', 0.14),
            color: 'primary.main',
            '& .MuiListItemIcon-root': { color: 'primary.main' },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
        <ListItemText
          primary={label}
          sx={{ '& .MuiTypography-root': { fontWeight: selected ? 700 : 500 } }}
        />
      </ListItemButton>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f2744', color: '#fff' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Box>
          <Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Amigo ERP
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            Servicing & Invoicing
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: alpha('#fff', 0.12) }} />
      <List sx={{ px: 0.5, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => navButton(item.href, item.label, item.icon))}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1.5, borderColor: alpha('#fff', 0.12) }} />
            <Typography variant="caption" sx={{ px: 2.5, pb: 1, opacity: 0.6, display: 'block' }}>
              ADMINISTRATION
            </Typography>
            {navButton('/admin/users', 'Users', <GroupIcon />)}
            {navButton('/admin/settings', 'Org Settings', <SettingsIcon />)}
          </>
        )}
      </List>
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha('#fff', 0.12)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>
            {user.name.slice(0, 1).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }} noWrap>{user.role.replace('_', ' ')}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#fff',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            ESP Servicing & Invoicing
          </Typography>
          {isAdmin && <NotificationBell />}
          <Chip
            avatar={<Avatar>{user.name.slice(0, 1).toUpperCase()}</Avatar>}
            label={user.name}
            variant="outlined"
            sx={{ mx: 1.5, display: { xs: 'none', md: 'flex' } }}
          />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout} sx={{ color: 'text.secondary' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
