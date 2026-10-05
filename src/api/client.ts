// small fetch wrapper for API calls used by the web UI
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('mogab:token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const text = await res.text().catch(() => '');

  let body: any = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch (_) {
    // not JSON
  }

  if (!res.ok) {
    const err = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    const error = new Error(String(err));
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }

  return body;
}
