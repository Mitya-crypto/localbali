'use client';

import { useEffect, useMemo, useState } from 'react';

import { TGUser, getTG, getUser } from './tg';

type ProfileSource = 'placeholder' | 'storage' | 'telegram' | 'mock';

type TelegramProfile = {
  user: TGUser | null;
  username: string | null;
  displayName: string;
  photoUrl: string | null;
  initials: string;
  source: ProfileSource;
};

type UseTelegramUserOptions = {
  /** Persist user details in localStorage for subsequent visits. */
  persist?: boolean;
};

type UseTelegramUserResult = TelegramProfile & {
  isLoading: boolean;
  isMock: boolean;
};

const STORAGE_KEY = 'tgUserCache';
const LEGACY_USERNAME_KEY = 'username';
const LEGACY_PHOTO_KEY = 'userPhoto';

const placeholderProfile: TelegramProfile = {
  user: null,
  username: null,
  displayName: '@guest',
  photoUrl: null,
  initials: 'CB',
  source: 'placeholder',
};

function ensureClient() {
  return typeof window !== 'undefined' ? window : undefined;
}

function stripAt(username: string) {
  return username.startsWith('@') ? username.slice(1) : username;
}

function ensureAt(username: string | null | undefined) {
  if (!username) return null;
  const trimmed = username.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function computeInitials(user: TGUser | null, displayName: string) {
  const letters: string[] = [];
  if (user?.first_name) letters.push(user.first_name.charAt(0));
  if (user?.last_name) letters.push(user.last_name.charAt(0));
  if (!letters.length && user?.username) letters.push(user.username.charAt(0));
  if (!letters.length) {
    const fallback = displayName.replace(/^@/, '').trim();
    if (fallback) letters.push(fallback.charAt(0));
  }
  if (!letters.length) return 'CB';
  return letters.join('').slice(0, 2).toUpperCase();
}

function normalizeUser(user: TGUser): TGUser {
  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    photo_url: user.photo_url,
  };
}

function buildProfile(user: TGUser | null, source: ProfileSource): TelegramProfile {
  if (!user) {
    return { ...placeholderProfile, source };
  }
  const username = ensureAt(user.username);
  const displayName = username ?? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'CryptoBali';
  const photoUrl = user.photo_url ?? null;
  const initials = computeInitials(user, displayName);
  return {
    user,
    username,
    displayName,
    photoUrl,
    initials,
    source,
  };
}

function readCachedUser(): TGUser | null {
  const client = ensureClient();
  if (!client) return null;
  try {
    const stored = client.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<TGUser> & { id?: number };
      if (parsed && typeof parsed === 'object') {
        return normalizeUser({
          id: typeof parsed.id === 'number' ? parsed.id : -1,
          username: parsed.username,
          first_name: parsed.first_name,
          last_name: parsed.last_name,
          photo_url: parsed.photo_url,
        });
      }
    }
  } catch {
    // ignore parsing errors
  }
  try {
    const legacyUsername = client.localStorage.getItem(LEGACY_USERNAME_KEY);
    const legacyPhoto = client.localStorage.getItem(LEGACY_PHOTO_KEY);
    if (legacyUsername || legacyPhoto) {
      return normalizeUser({
        id: -1,
        username: legacyUsername ? stripAt(legacyUsername) : undefined,
        first_name: undefined,
        last_name: undefined,
        photo_url: legacyPhoto ?? undefined,
      });
    }
  } catch {
    // ignore legacy access errors
  }
  return null;
}

function persistUser(user: TGUser) {
  const client = ensureClient();
  if (!client) return;
  try {
    const data = normalizeUser(user);
    client.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const usernameWithAt = ensureAt(data.username);
    if (usernameWithAt) client.localStorage.setItem(LEGACY_USERNAME_KEY, usernameWithAt);
    else client.localStorage.removeItem(LEGACY_USERNAME_KEY);
    if (data.photo_url) client.localStorage.setItem(LEGACY_PHOTO_KEY, data.photo_url);
    else client.localStorage.removeItem(LEGACY_PHOTO_KEY);
  } catch {
    // ignore persistence errors
  }
}

export function useTelegramUser(options: UseTelegramUserOptions = {}): UseTelegramUserResult {
  const { persist = true } = options;
  const [profile, setProfile] = useState<TelegramProfile>(() => {
    const cached = readCachedUser();
    if (cached) return buildProfile(cached, 'storage');
    return placeholderProfile;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const tgUser = getUser();
    const tgInstance = getTG();

    if (tgUser) {
      const normalized = normalizeUser(tgUser);
      const source: ProfileSource = tgInstance
        ? 'telegram'
        : process.env.NEXT_PUBLIC_TG_MOCK === '1'
          ? 'mock'
          : 'storage';
      if (!cancelled) {
        setProfile(buildProfile(normalized, source));
        if (persist) persistUser(normalized);
      }
    } else {
      const cached = readCachedUser();
      if (!cancelled) {
        if (cached) setProfile(buildProfile(cached, 'storage'));
        else setProfile(placeholderProfile);
      }
    }

    if (!cancelled) setIsLoading(false);
    return () => {
      cancelled = true;
    };
  }, [persist]);

  return useMemo(
    () => ({
      ...profile,
      isLoading,
      isMock: profile.source === 'mock',
    }),
    [profile, isLoading],
  );
}
