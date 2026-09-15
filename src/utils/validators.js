/**
 * Checks if a value is provided and not just empty spaces.
 * Returns true if valid, false if empty.
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  // Convert to string and remove leading/trailing spaces, then check length
  return String(value).trim().length > 0;
};

/**
 * Checks if the string matches a standard email pattern.
 * Returns true if it looks like an email, false otherwise.
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // A standard regular expression (Regex) that looks for: text @ text . text
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if the string matches a basic phone number pattern.
 * Allows digits, spaces, plus, minus, and parentheses.
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Regex that only allows numbers and common phone formatting characters
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 7; // Require at least 7 characters
};

/**
 * Checks if a string is a valid URL.
 * Uses the built-in browser URL constructor which automatically throws an error if invalid.
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url); // If this fails, it jumps to the catch block
    return true;
  } catch (err) {
    return false;
  }
};
