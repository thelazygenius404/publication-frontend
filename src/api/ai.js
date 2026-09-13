import api from './api';

export async function generateDraft(
  payload,
) {
  const response =
    await api.post(
      '/api/ai/generate',
      payload,
    );

  return response.data;
}

export async function improveDraft(
  payload,
) {
  const response =
    await api.post(
      '/api/ai/improve',
      payload,
    );

  return response.data;
}