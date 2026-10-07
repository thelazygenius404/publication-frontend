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

export async function getContentMedia(
  contentId,
) {
  const response =
    await api.get(
      `/api/contents/${contentId}/media`,
    );

  return response.data;
}

export async function uploadContentMedia(
  contentId,
  file,
  altText,
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  if (altText?.trim()) {
    formData.append(
      'altText',
      altText.trim(),
    );
  }

  const response =
    await api.post(
      `/api/contents/${contentId}/media`,
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      },
    );

  return response.data;
}

export async function updateContentMediaAltText(
  contentId,
  mediaId,
  altText,
) {
  const response =
    await api.patch(
      `/api/contents/${contentId}/media/${mediaId}`,
      {
        altText:
          altText?.trim() ||
          null,
      },
    );

  return response.data;
}

export async function deleteContentMedia(
  contentId,
  mediaId,
) {
  const response =
    await api.delete(
      `/api/contents/${contentId}/media/${mediaId}`,
    );

  return response.data;
}

export async function getContentMediaFile(
  contentId,
  mediaId,
) {
  const response =
    await api.get(
      `/api/contents/${contentId}/media/${mediaId}/file`,
      {
        responseType:
          'blob',
      },
    );

  return response.data;
}