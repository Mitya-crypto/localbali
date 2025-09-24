export type EmailVerificationSession = {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  userId?: string;
  createdAt: number;
};

export type ProfileRecord = {
  email?: string;
  emailVerified: boolean;
  verifiedAt?: number;
};

export type Mem = {
  links: Map<string, string>;
  levels: Map<string, number>;
  emailSessions: Map<string, EmailVerificationSession>;
  profiles: Map<string, ProfileRecord>;
};

const g = globalThis as any;
if (!g.__MEMDB__) {
  g.__MEMDB__ = {
    links: new Map(),
    levels: new Map(),
    emailSessions: new Map(),
    profiles: new Map(),
  } as Mem;
}

export const memdb: Mem = g.__MEMDB__;
