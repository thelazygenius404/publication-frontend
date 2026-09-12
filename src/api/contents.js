import api from './api';

export async function getContents() {
  const response =
    await api.get(
      '/api/contents',
    );

  return response.data;
}