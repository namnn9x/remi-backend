import crypto from 'crypto';

/**
 * Generate a unique short ID (8-12 characters alphanumeric)
 * Used for shareId and contributeId
 */
export const generateShortId = (): string => {
  // Generate random bytes and convert to base64url-like string
  const randomBytes = crypto.randomBytes(8);
  const base64 = randomBytes.toString('base64');
  // Remove special characters, keep only alphanumeric
  return base64
    .replace(/[+/=]/g, '')
    .substring(0, 12)
    .toLowerCase();
};

/**
 * Generate shareId and contributeId for a memory book
 */
export const generatePublicIds = (): { shareId: string; contributeId: string } => {
  let shareId: string;
  let contributeId: string;
  
  // Ensure they are different
  do {
    shareId = generateShortId();
    contributeId = generateShortId();
  } while (shareId === contributeId);
  
  return { shareId, contributeId };
};
