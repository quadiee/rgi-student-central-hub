
// Utility function to get the correct app URL for redirects and links
export const getAppUrl = (): string => {
  // Always use the production URL for consistency
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

// Get invitation URL with proper token
export const getInvitationUrl = (token: string): string => {
  return getAppUrlWithPath(`/invite/${token}`);
};

// Get password reset URL
export const getPasswordResetUrl = (): string => {
  return getAppUrlWithPath('/reset-password');
};
