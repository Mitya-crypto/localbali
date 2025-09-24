export type EmailStatus = {
  email?: string;
  verified: boolean;
  pending: boolean;
  expiresAt?: number;
};

export type EmailStatusEventDetail = EmailStatus;
