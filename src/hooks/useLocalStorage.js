import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
  // 1. Instead of a simple value, we pass a function to useState.
  // This runs ONE time when the component first loads.
  const [value, setValue] = useState(() => {
    // Try to find the backup in the browser's memory
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      // LocalStorage only stores Strings. We must parse it back into real JavaScript (like a boolean)
      return JSON.parse(saved); 
    }
    // If no backup exists, use the default!
    return initialValue;
  });

  // 2. Every time the 'value' changes, silently update the browser's memory!
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // We return an array exactly like normal useState does: [state, setState]
  return [value, setValue];
}
