import api from './api';

export async function getAccounts() {
  const response =
    await api.get(
      '/api/accounts',
    );

  return response.data;
}

export async function linkWordPressAccount(
  payload,
) {
  const response =
    await api.post(
      '/api/accounts/wordpress',
      payload,
    );

  return response.data;
}

export async function disconnectWordPressAccount() {
  const response =
    await api.delete(
      '/api/accounts/wordpress',
    );

  return response.data;
}

export async function getLinkedInAuthorizationUrl() {
  const response =
    await api.get(
      '/api/accounts/linkedin/authorization-url',
    );

  return response.data;
}

export async function disconnectLinkedInAccount() {
  const response =
    await api.delete(
      '/api/accounts/linkedin',
    );

  return response.data;
}