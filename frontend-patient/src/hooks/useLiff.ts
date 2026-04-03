import liff from '@line/liff';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffContext {
  isReady: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  isMockMode: boolean;
  profile: LiffProfile | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  closeWindow: () => void;
}

const MOCK_PROFILE: LiffProfile = {
  userId: 'U-demo-001',
  displayName: 'Demo User',
  pictureUrl: 'https://via.placeholder.com/100',
  statusMessage: 'Mock LIFF mode'
};

function parseBooleanEnv(value: string | undefined, fallback = false) {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function getRedirectUri() {
  return import.meta.env.VITE_LIFF_URL?.trim() || window.location.href;
}

export function useLiff(): LiffContext {
  const liffId = import.meta.env.VITE_LIFF_ID?.trim();
  const isMockMode = useMemo(
    () => parseBooleanEnv(import.meta.env.VITE_LIFF_MOCK, import.meta.env.DEV && !liffId),
    [liffId]
  );

  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (isMockMode) {
        if (!isMounted) return;
        setProfile(MOCK_PROFILE);
        setIsLoggedIn(true);
        setIsReady(true);
        setIsInClient(false);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!liffId) {
        if (!isMounted) return;
        setError('\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32 LIFF ID \u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a LINE Mini App');
        setIsLoading(false);
        return;
      }

      try {
        await liff.init({
          liffId,
          withLoginOnExternalBrowser: true
        });

        if (!isMounted) return;

        setIsReady(true);
        setIsInClient(liff.isInClient());
        setIsLoggedIn(liff.isLoggedIn());

        if (liff.isLoggedIn()) {
          const nextProfile = await liff.getProfile();
          if (!isMounted) return;
          setProfile({
            userId: nextProfile.userId,
            displayName: nextProfile.displayName,
            pictureUrl: nextProfile.pictureUrl,
            statusMessage: nextProfile.statusMessage
          });
        }

        setError(null);
      } catch (nextError) {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : '\u0e40\u0e1b\u0e34\u0e14 LINE Mini App \u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [isMockMode, liffId]);

  const login = useCallback(() => {
    if (isMockMode) {
      setProfile(MOCK_PROFILE);
      setIsLoggedIn(true);
      setIsReady(true);
      setError(null);
      return;
    }

    if (!liffId) {
      setError('\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32 LIFF ID \u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a LINE Mini App');
      return;
    }

    liff.login({ redirectUri: getRedirectUri() });
  }, [isMockMode, liffId]);

  const logout = useCallback(() => {
    if (isMockMode) {
      setProfile(null);
      setIsLoggedIn(false);
      setIsReady(false);
      return;
    }

    liff.logout();
    window.location.reload();
  }, [isMockMode]);

  const closeWindow = useCallback(() => {
    if (!isMockMode && liff.isInClient()) {
      liff.closeWindow();
    }
  }, [isMockMode]);

  return {
    isReady,
    isLoggedIn,
    isInClient,
    isMockMode,
    profile,
    userId: profile?.userId ?? null,
    isLoading,
    error,
    login,
    logout,
    closeWindow
  };
}

export default useLiff;
