const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data;
};

export const fileSystemApi = {
  fetchState: () => request('/api/filesystem/state'),
  createItem: (body) =>
    request('/api/filesystem/items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  renameItem: (body) =>
    request('/api/filesystem/items/rename', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  moveItem: (body) =>
    request('/api/filesystem/items/move', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  copyItem: (body) =>
    request('/api/filesystem/items/copy', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteItem: (path) =>
    request(`/api/filesystem/items?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    }),
  updateFileContent: (body) =>
    request('/api/filesystem/files/content', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
