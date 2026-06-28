import { useState, useEffect } from 'react';

/**
 * Debounces a value — only updates after the user stops changing it for `delay` ms.
 * @param {*} value - The value to debounce.
 * @param {number} delay - Milliseconds to wait (default: 300).
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
