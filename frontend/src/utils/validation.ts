export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\[\]\\;'/+=~`]).{8,16}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  if (!value.trim()) return 'Name is required.';
  return null;
}

export function validateEmail(value: string): string | null {
  if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

export function validateAddress(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Address is required.';
  if (v.length > 400) return 'Address must be at most 400 characters.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!PASSWORD_REGEX.test(value))
    return 'Password must be 8-16 characters with at least one uppercase letter and one special character.';
  return null;
}
