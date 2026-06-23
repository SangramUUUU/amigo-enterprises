'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AppBar, Box, Button, Card, CardContent, Container, Grid, IconButton,
  Stack, Toolbar, Typography, alpha, useTheme,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BuildIcon from '@mui/icons-material/Build';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '@/lib/auth';

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const PRODUCTS = [
  {
    title: 'ESP Filter Bags & Spares',
    points: [
      'High-quality filter bags for electrostatic precipitator dust collection.',
      'Compatible with major ESP makes and collector configurations.',
      'Timely supply with GST invoicing and traceable documentation.',
    ],
  },
  {
    title: 'High Frequency Rectifier Systems',
    points: [
      'Servicing and support for HF rectifier transformers and power supplies.',
      'Improved collection efficiency for fine, high-resistivity dust particles.',
      'Upgrade paths for existing ESP installations without full collector change.',
    ],
  },
];

const SERVICES = [
  { icon: <BuildIcon fontSize="large" />, title: 'Field Service', desc: 'On-site ESP inspection, troubleshooting, and corrective maintenance.' },
  { icon: <HandshakeIcon fontSize="large" />, title: 'AMC Contracts', desc: 'Annual maintenance contracts with scheduled visits and priority support.' },
  { icon: <EngineeringIcon fontSize="large" />, title: 'System Upgrades', desc: 'Rectifier upgrades, rapping optimization, and performance audits.' },
];

const VALUES = [
  { title: 'MISSION', text: 'Keep the customer at the centre of all we do.' },
  { title: 'VISION', text: 'Creating an empowered workforce driven by passion and purpose.' },
  { title: 'VALUES', text: 'Sustainable growth with a focus on profitability and market leadership.' },
];

const CLIENTS = [
  'Sugar Plants', 'Steel Mills', 'Cement Plants', 'Power Utilities',
  'Paper Mills', 'Chemical Industries', 'Boiler Houses', 'Process Industries',
];

const EXPORT_REGIONS = ['India', 'Middle East', 'South East Asia', 'Africa'];

export default function LandingPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [clientOffset, setClientOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % PRODUCTS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setClientOffset((o) => (o + 1) % CLIENTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const product = PRODUCTS[heroIndex];
  const portalHref = mounted && user ? '/dashboard' : '/login';
  const portalLabel = mounted && user ? 'Dashboard' : 'Login';

  return (
    <Box sx={{ bgcolor: '#f4f7fb' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#0d2137', borderBottom: '1px solid', borderColor: alpha('#fff', 0.08) }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, py: 0.5 }}>
            <BoltIcon sx={{ color: '#42a5f5', mr: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, letterSpacing: 0.5 }}>
              Amigo Enterprises
            </Typography>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {NAV.map((item) => (
                <Button key={item.href} color="inherit" onClick={() => scrollTo(item.href)} sx={{ fontWeight: 500, opacity: 0.9 }}>
                  {item.label}
                </Button>
              ))}
            </Stack>
            <Button
              component={Link}
              href={portalHref}
              variant="contained"
              size="small"
              sx={{ ml: 1, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
            >
              {portalLabel}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero */}
      <Box
        id="home"
        sx={{
          background: 'linear-gradient(135deg, #0d2137 0%, #1565c0 55%, #1976d2 100%)',
          color: '#fff',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
                ESP Servicing & Power Solutions
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.15 }}>
                Amigo Enterprises
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.92, maxWidth: 560, lineHeight: 1.6 }}>
                Your partner in electrostatic precipitator servicing, spares supply, and high-frequency power solutions for industry.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => scrollTo('#contact')} sx={{ bgcolor: '#fff', color: '#0d47a1', '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>
                  Contact Us
                </Button>
                <Button variant="outlined" size="large" onClick={() => scrollTo('#products')} sx={{ borderColor: alpha('#fff', 0.6), color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.08) } }}>
                  Our Products
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Newly Launched
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, minHeight: 64 }}>
                    {product.title}
                  </Typography>
                  <Stack spacing={1.2} component="ul" sx={{ m: 0, pl: 2.2 }}>
                    {product.points.map((p) => (
                      <Typography key={p} component="li" variant="body2" color="text.secondary">
                        {p}
                      </Typography>
                    ))}
                  </Stack>
                  <Stack direction="row" sx={{ mt: 2.5, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={0.5}>
                      {PRODUCTS.map((_, i) => (
                        <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === heroIndex ? 'primary.main' : alpha('#000', 0.15) }} />
                      ))}
                    </Stack>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => setHeroIndex((i) => (i - 1 + PRODUCTS.length) % PRODUCTS.length)}><ChevronLeftIcon /></IconButton>
                      <IconButton size="small" onClick={() => setHeroIndex((i) => (i + 1) % PRODUCTS.length)}><ChevronRightIcon /></IconButton>
                    </Stack>
                  </Stack>
                  <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => scrollTo('#contact')}>
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Export regions */}
      <Box sx={{ py: 5, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
            Export & Service Regions
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {EXPORT_REGIONS.map((r) => (
              <Box key={r} sx={{ px: 3, py: 1.5, borderRadius: 2, bgcolor: alpha('#1565c0', 0.08), border: '1px solid', borderColor: alpha('#1565c0', 0.2) }}>
                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{r}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Products */}
      <Box id="products" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1 }}>Products</Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 5, maxWidth: 640, mx: 'auto' }}>
            Spares and power equipment for electrostatic precipitator plants across sugar, steel, cement, and process industries.
          </Typography>
          <Grid container spacing={3}>
            {PRODUCTS.map((p) => (
              <Grid key={p.title} size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>{p.title}</Typography>
                    <Stack spacing={1.2} component="ul" sx={{ m: 0, pl: 2.2 }}>
                      {p.points.map((pt) => (
                        <Typography key={pt} component="li" variant="body2" color="text.secondary">{pt}</Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services */}
      <Box id="services" sx={{ py: 8, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5 }}>Services</Typography>
          <Grid container spacing={3}>
            {SERVICES.map((s) => (
              <Grid key={s.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{s.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission Vision Values */}
      <Box id="about" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5 }}>
            Our Mission, Vision &amp; Values
          </Typography>
          <Grid container spacing={3}>
            {VALUES.map((v) => (
              <Grid key={v.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', borderRadius: 3, bgcolor: '#0d2137', color: '#fff' }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, color: '#42a5f5' }}>{v.title}</Typography>
                    <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, opacity: 0.92 }}>{v.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Clients marquee */}
      <Box sx={{ py: 6, bgcolor: '#fff', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4 }}>
            Our Satisfied Clients
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CLIENTS.map((c, i) => (
              <Box
                key={c}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: i === clientOffset % CLIENTS.length ? alpha('#1565c0', 0.1) : 'transparent',
                  transition: 'background-color 0.4s',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>{c}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Contact */}
      <Box id="contact" sx={{ py: 8, bgcolor: alpha('#1565c0', 0.06) }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Contact Us</Typography>
              <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                Reach out for ESP spares, servicing quotations, AMC proposals, or technical support. Our team responds promptly to plant enquiries.
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <EmailIcon color="primary" />
                  <Typography>info@amigoenterprises.com</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <PhoneIcon color="primary" />
                  <Typography>+91 98765 43210</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <LocationOnIcon color="primary" sx={{ mt: 0.3 }} />
                  <Typography>Maharashtra, India</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Staff Portal</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Authorized users can sign in to manage customers, inventory, invoices, AMC contracts, and service jobs.
                </Typography>
                <Button component={Link} href={portalHref} variant="contained" size="large" fullWidth>
                  {mounted && user ? 'Open Dashboard' : 'Staff Login'}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, bgcolor: '#0d2137', color: alpha('#fff', 0.75), textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2">
            © {new Date().getFullYear()} Amigo Enterprises. ESP Servicing &amp; Invoicing.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
