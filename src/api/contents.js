import api from './api';

export async function getContents() {
  const response =
    await api.get(
      '/api/contents',
    );

  return response.data;
}

export async function createContent(
  payload,
) {
  const response =
    await api.post(
      '/api/contents',
      payload,
    );

  return response.data;
}

export async function updateContent(
  id,
  payload,
) {
  const response =
    await api.put(
      `/api/contents/${id}`,
      payload,
    );

  return response.data;
}

export async function markContentReady(
  id,
) {
  const response =
    await api.post(
      `/api/contents/${id}/ready`,
    );

  return response.data;
}