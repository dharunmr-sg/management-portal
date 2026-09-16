/**
 * Checks if a value is provided and not just empty spaces.
 * Returns true if valid, false if empty.
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

/**
 * Checks if the string matches a normal alphabetic name.
 * Allows spaces, hyphens, and apostrophes (e.g., "O'Connor", "Anne-Marie").
 */
export const isValidName = (name) => {
  if (!name) return false;
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name.trim()) && name.trim().length > 0;
};

/**
 * Checks if the username contains only letters, numbers, underscores, and hyphens.
 * No spaces allowed.
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
};

/**
 * Checks if the string matches a standard email pattern.
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if the string matches a basic phone number pattern.
 * Allows digits, spaces, plus, minus, and parentheses.
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 7;
};

/**
 * Checks if a password is at least 8 characters long.
 * Also checks if it contains at least one number and one letter for basic security.
 */
export const isValidPassword = (password) => {
  if (!password) return false;
  if (password.length < 8) return false;
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

/**
 * Checks if the confirm password perfectly matches the original password.
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
};

/**
 * Checks if a string is a valid calendar date.
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  // 'Invalid Date' will return NaN when getTime() is called
  return !isNaN(date.getTime());
};

/**
 * Checks if a string's length falls between a minimum and maximum limit.
 */
export const isValidLength = (value, min, max) => {
  if (value === null || value === undefined) return false;
  const length = String(value).trim().length;
  return length >= min && length <= max;
};

/**
 * Checks if a string is a valid URL.
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};
