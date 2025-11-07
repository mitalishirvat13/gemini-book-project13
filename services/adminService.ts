
const PASSKEY_STORAGE_KEY = 'admin_passkey';

/**
 * Retrieves the admin passkey from localStorage, or returns the default.
 * @returns The stored or default admin passkey.
 */
export const getPasskey = (): string => {
  try {
    return localStorage.getItem(PASSKEY_STORAGE_KEY) || 'admin123';
  } catch (e) {
    console.error("Could not access localStorage. Using default passkey.", e);
    return 'admin123';
  }
};

/**
 * Saves a new admin passkey to localStorage.
 * @param newPasskey The new passkey to store.
 */
export const setPasskey = (newPasskey: string): void => {
  try {
    localStorage.setItem(PASSKEY_STORAGE_KEY, newPasskey);
  } catch (e) {
    console.error("Could not save passkey to localStorage.", e);
  }
};

/**
 * Verifies if the provided passkey matches the stored one.
 * @param passkey The passkey to verify.
 * @returns True if the passkey is correct, false otherwise.
 */
export const verifyPasskey = (passkey: string): boolean => {
  return passkey === getPasskey();
};
