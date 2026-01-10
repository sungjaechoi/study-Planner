import type {
  DayPlannerResponse,
  CreateBlockRequest,
  UpdateBlockRequest,
  CreateSubjectRequest,
  UpdateSettingsRequest,
  SettingsResponse
} from '@/types';

const API_BASE = '/api';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'API Error');
  }

  return res.json();
}

// Planner APIs
export async function fetchDayData(date: string): Promise<DayPlannerResponse> {
  return fetchAPI<DayPlannerResponse>(`/planner/day?date=${date}`);
}

export async function fetchSummary(from: string, to: string) {
  return fetchAPI(`/planner/summary?from=${from}&to=${to}`);
}

// Block APIs
export async function createBlock(data: CreateBlockRequest) {
  return fetchAPI('/blocks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBlock(id: string, data: UpdateBlockRequest) {
  return fetchAPI(`/blocks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBlock(id: string) {
  return fetchAPI(`/blocks/${id}`, {
    method: 'DELETE',
  });
}

// Settings APIs
export async function fetchSettings() {
  return fetchAPI('/settings');
}

export async function updateSettings(data: UpdateSettingsRequest): Promise<SettingsResponse> {
  return fetchAPI<SettingsResponse>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Subject APIs
export async function fetchSubjects() {
  return fetchAPI('/subjects');
}

export async function createSubject(data: CreateSubjectRequest) {
  return fetchAPI('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteSubject(id: string) {
  return fetchAPI(`/subjects/${id}`, {
    method: 'DELETE',
  });
}
