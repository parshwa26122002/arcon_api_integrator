export const getAuthToken = (): boolean => {
  const cookie = document.cookie;
  const authToken = cookie.match("authToken");
  return authToken ? true:false
};

export const isAuthenticated = (): boolean => {
  return getAuthToken();
};

// export const logout = (): void => {
//   document.cookie = "authToken=; Max-Age=0; path=/";
// };
