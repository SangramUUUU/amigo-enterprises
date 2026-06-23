import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Amigo Enterprises ERP',
  description: 'ESP Servicing & Invoicing ERP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
