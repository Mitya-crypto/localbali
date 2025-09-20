export type EmailVerificationSession = {
  userId: string;
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

export type UserRecord = {
  id: string;
  email?: string;
  verified: boolean;
  verifiedAt?: number;
};

export type Mem = {
  links: Map<string, string>;
  levels: Map<string, number>;
  emailSessions: Map<string, EmailVerificationSession>;
  users: Map<string, UserRecord>;
};

const g = globalThis as any;
if (!g.__MEMDB__) {
  g.__MEMDB__ = {
    links: new Map(),
    levels: new Map(),
    emailSessions: new Map(),
    users: new Map(),
  } as Mem;
}

export const memdb: Mem = g.__MEMDB__;
