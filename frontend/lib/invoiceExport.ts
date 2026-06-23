function formatExportDate(date: string | Date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function normalizePrefix(prefix?: string) {
  const cleaned = String(prefix || 'AETX')
    .trim()
    .replace(/[-_\s]+$/g, '')
    .toUpperCase();
  return cleaned || 'AETX';
}

export function buildInvoiceExportFilename({
  prefix,
  invoiceDate,
  customerName,
  extension,
}: {
  prefix?: string;
  invoiceDate: string | Date;
  customerName: string;
  extension: 'pdf' | 'docx';
}) {
  const pfx = normalizePrefix(prefix);
  const date = formatExportDate(invoiceDate);
  const customer = String(customerName || 'CUSTOMER').trim().replace(/\s+/g, ' ');
  const raw = `${pfx}_${date}_${customer}`;
  const safe = raw.replace(/[<>:"/\\|?*]/g, '_');
  return `${safe}.${extension}`;
}

export function prefixFromInvoiceNumber(invoiceNumber: string) {
  const match = String(invoiceNumber).match(/^([A-Za-z0-9]+)/);
  return match ? match[1].toUpperCase() : 'AETX';
}
