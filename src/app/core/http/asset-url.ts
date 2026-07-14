import { environment } from '../../../environments/environment';

const API_ORIGIN = environment.apiUrl.replace(/\/api\/?$/, '');

export function resolveStorageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `${API_ORIGIN}/${url.replace(/^\/+/, '')}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/storage/')) {
      return `${API_ORIGIN}${parsed.pathname}`;
    }
  } catch {
    return url;
  }

  return url;
}
