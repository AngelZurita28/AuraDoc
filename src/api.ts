import type { SearchResponse, LoginCredentials, UserSession, DocumentDetailResponse } from './types';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.API_BACKEND_URL || 'http://127.0.0.1:3000');
const API_DOTNET_BASE = import.meta.env.DEV ? '' : (import.meta.env.API_DOTNET_URL || 'http://127.0.0.1:5000');

export async function searchDocuments(query: string, deepSearch = false): Promise<SearchResponse> {
  const endpoint = deepSearch ? 'deepsearch' : 'search';
  const url = `${API_BASE}/api/documents/${endpoint}?q=${encodeURIComponent(query)}`;
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

export async function fetchDocumentDetail(id: string): Promise<DocumentDetailResponse> {
  const url = `${API_BASE}/api/documents/${id}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message || `Error HTTP ${response.status}`
    );
  }

  const result: DocumentDetailResponse = await response.json();
  return result;
}

export async function loginUser(credentials: LoginCredentials): Promise<UserSession> {
  const url = `${API_DOTNET_BASE}/api/auth/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message || `Error HTTP ${response.status}`
    );
  }

  const result: UserSession = await response.json();
  return result;
}

