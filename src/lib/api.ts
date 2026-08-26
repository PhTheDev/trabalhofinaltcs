export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

type Paginated<T> = {
  data?: T[];
  meta?: { totalPages?: number };
};

const errorMessage = (body: unknown, status: number) => {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return String(message[0]);
    if (typeof message === 'string') return message;
  }
  return `Erro ${status}`;
};

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(errorMessage(body, res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
};

export const apiList = async <T>(path: string, signal?: AbortSignal): Promise<T[]> => {
  const first = await apiRequest<Paginated<T>>(`${path}?page=1&limit=100`, { signal });
  const items = first.data ?? [];
  const totalPages = first.meta?.totalPages ?? 1;
  if (totalPages <= 1) return items;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      apiRequest<Paginated<T>>(`${path}?page=${index + 2}&limit=100`, { signal }),
    ),
  );

  return items.concat(...rest.map((page) => page.data ?? []));
};
