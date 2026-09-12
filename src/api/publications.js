import api from './api';

export async function getPublications() {
  const response =
    await api.get(
      '/api/publications',
    );

  return response.data;
}