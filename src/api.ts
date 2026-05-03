import type { SearchResponse } from './types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : 'http://angelzurita.servequake.com:3000';

export async function searchDocuments(query: string): Promise<SearchResponse> {
  const url = `${API_BASE}/api/documents/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message || `Error HTTP ${response.status}`
    );
  }

  const result: SearchResponse = await response.json();
  return result;
}
