export const getAuthToken = (): boolean => {
  try {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: string });
    
    return !!cookies['authToken'];
  } catch (e) {
    console.error('Error checking auth token:', e);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken();
};

// export const logout = (): void => {
//   document.cookie = "authToken=; Max-Age=0; path=/";
// };
