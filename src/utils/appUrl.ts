
// Utility function to get the correct app URL for redirects and links
export const getAppUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side or when window is not available
  return 'https://rgi-student-central-hub.lovable.app';
};

// Get the full URL for a specific path
export const getAppUrlWithPath = (path: string): string => {
  const baseUrl = getAppUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Validate if a URL is from our app
export const isAppUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const appUrl = new URL(getAppUrl());
    return urlObj.origin === appUrl.origin;
  } catch {
    return false;
  }
};
