// Centralized admin API helper for secure admin operations
const ADMIN_DATA_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`;

interface AdminApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export async function adminApiCall<T = unknown>(
  action: string,
  data?: Record<string, unknown>
): Promise<AdminApiResponse<T>> {
  const sessionToken = sessionStorage.getItem('admin_session');

  if (!sessionToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(ADMIN_DATA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        sessionToken,
        data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return result;
  } catch (error) {
    console.error('Admin API error:', error);
    return { error: 'Network error' };
  }
}

// Site Content operations
export const updateSiteContent = (sectionKey: string, content: {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  extra_data?: unknown;
}) => adminApiCall('update-site-content', { section_key: sectionKey, ...content });

// Gallery operations
export const createGalleryItem = (item: {
  title: string;
  image_url: string;
  category?: string | null;
  is_active?: boolean;
  display_order?: number;
  media_type?: string;
}) => adminApiCall('create-gallery-item', item);

export const updateGalleryItem = (id: string, item: {
  title?: string;
  image_url?: string;
  category?: string | null;
  is_active?: boolean;
  display_order?: number;
  media_type?: string;
}) => adminApiCall('update-gallery-item', { id, ...item });

export const deleteGalleryItem = (id: string) => 
  adminApiCall('delete-gallery-item', { id });

// Storage operations
export const getUploadUrl = (fileName: string, contentType?: string) =>
  adminApiCall<{ signedUrl: string; token: string; path: string; publicUrl: string }>(
    'get-upload-url',
    { fileName, contentType }
  );
