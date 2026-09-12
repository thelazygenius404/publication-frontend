import api from './api';

export async function getAccounts() {
  const response =
    await api.get(
      '/api/accounts',
    );

  return response.data;
}