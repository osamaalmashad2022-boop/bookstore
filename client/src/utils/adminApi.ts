export const ADMIN_TOKEN_KEY = 'maqbara_admin_token';

export const getAdminToken = (): string => {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
};

export const setAdminToken = (token: string): void => {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = (): void => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  return Boolean(getAdminToken());
};

export const adminFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
    'x-admin-token': token,
  };
  return fetch(url, { ...options, headers });
};

