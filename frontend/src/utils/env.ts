export const isElectron = (): boolean => {
  return navigator.userAgent.toLowerCase().includes('electron');
};