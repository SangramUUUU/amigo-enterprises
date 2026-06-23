const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error || 'ERROR',
      body.message || res.statusText
    );
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res as unknown as T;
}

export async function fetchBlob(path: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error || 'ERROR',
      body.message || res.statusText
    );
  }
  return res.blob();
}

export function downloadFile(path: string, filename: string) {
  fetchBlob(path)
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(objectUrl);
      document.body.removeChild(link);
    })
    .catch((err) => console.error('Download failed:', err));
}

export async function previewPdf(path: string): Promise<string> {
  const blob = await fetchBlob(path);
  return URL.createObjectURL(blob);
}
