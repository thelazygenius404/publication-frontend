import api from './api';

export async function getContents() {
  const response =
    await api.get(
      '/api/contents',
    );

  return response.data;
}

export async function getContent(
  id,
) {
  const response =
    await api.get(
      `/api/contents/${id}`,
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

export async function deleteContent(
  id,
) {
  const response =
    await api.delete(
      `/api/contents/${id}`,
    );

  return response.data;
}