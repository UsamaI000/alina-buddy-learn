export interface PasswordStrength {
  score: number; // 0-4 (0: very weak, 4: very strong)
  feedback: string[];
  isValid: boolean;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;

/**
 * Validate password strength and requirements
 */
export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    feedback.push(`Mindestens ${PASSWORD_REQUIREMENTS.minLength} Zeichen erforderlich`);
  } else {
    score += 1;
  }

  // Check uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Mindestens ein Großbuchstabe erforderlich');
  } else {
    score += 1;
  }

  // Check lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Mindestens ein Kleinbuchstabe erforderlich');
  } else {
    score += 1;
  }

  // Check numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    feedback.push('Mindestens eine Zahl erforderlich');
  } else {
    score += 1;
  }

  // Check special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Mindestens ein Sonderzeichen erforderlich (!@#$%^&*...)');
  } else {
    score += 1;
  }

  // Additional strength checks
  if (password.length >= 12) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password) && password.length >= 10) score += 1;

  const isValid = feedback.length === 0 && score >= 4;

  return {
    score: Math.min(score, 4),
    feedback,
    isValid,
  };
}

/**
 * Get password strength text and color
 */
export function getPasswordStrengthInfo(score: number): { text: string; color: string } {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Sehr schwach', color: 'text-destructive' };
    case 2:
      return { text: 'Schwach', color: 'text-warning' };
    case 3:
      return { text: 'Mittel', color: 'text-info' };
    case 4:
      return { text: 'Stark', color: 'text-success' };
    default:
      return { text: 'Unbekannt', color: 'text-muted-foreground' };
  }
}