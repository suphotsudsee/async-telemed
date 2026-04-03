import { useState, useEffect, useCallback } from 'react';
// Mock profile for development
const MOCK_PROFILE = {
    userId: 'U-demo-001',
    displayName: 'Demo User',
    pictureUrl: 'https://via.placeholder.com/100',
    statusMessage: 'Testing LIFF integration'
};
// Check if running in LINE
function isLineEnvironment() {
    if (typeof window === 'undefined')
        return false;
    return /Line/.test(navigator.userAgent) || window.location.search.includes('liff.state');
}
export function useLiff() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // LIFF ID from environment
    const liffId = import.meta.env.VITE_LIFF_ID;
    useEffect(() => {
        // If no LIFF ID or not in LINE, use mock
        if (!liffId || !isLineEnvironment()) {
            console.log('[LIFF] Running in development/mock mode');
            setProfile(MOCK_PROFILE);
            setIsLoggedIn(true);
            setIsLoading(false);
            return;
        }
        // In production, load LIFF SDK dynamically
        const loadLiff = async () => {
            try {
                // @ts-ignore - LIFF loads globally
                const liff = window.liff;
                if (!liff) {
                    throw new Error('LIFF SDK not loaded');
                }
                await liff.init({ liffId });
                setIsLoggedIn(liff.isLoggedIn());
                if (liff.isLoggedIn()) {
                    const userProfile = await liff.getProfile();
                    setProfile(userProfile);
                }
                setIsLoading(false);
            }
            catch (err) {
                console.error('[LIFF] Init failed:', err);
                setError(err instanceof Error ? err.message : 'LIFF initialization failed');
                setIsLoading(false);
            }
        };
        loadLiff();
    }, [liffId]);
    const login = useCallback(() => {
        if (!liffId || !isLineEnvironment()) {
            // Mock login
            setProfile(MOCK_PROFILE);
            setIsLoggedIn(true);
            return;
        }
        // @ts-ignore
        window.liff?.login();
    }, [liffId]);
    const logout = useCallback(() => {
        // @ts-ignore
        window.liff?.logout();
        setProfile(null);
        setIsLoggedIn(false);
    }, []);
    const closeWindow = useCallback(() => {
        // @ts-ignore
        window.liff?.closeWindow();
    }, []);
    return {
        isLoggedIn,
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
