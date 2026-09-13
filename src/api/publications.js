import api from './api';

export async function getPublications() {
  const response =
    await api.get(
      '/api/publications',
    );

  return response.data;
}

export async function createPublication(
  payload,
) {
  const response =
    await api.post(
      '/api/publications',
      payload,
    );

  return response.data;
}

export async function cancelPublication(
  id,
) {
  const response =
    await api.post(
      `/api/publications/${id}/cancel`,
    );

  return response.data;
}