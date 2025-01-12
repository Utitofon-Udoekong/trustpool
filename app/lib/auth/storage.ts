const STORAGE_KEY = 'trustpool_auth';

// Add session configuration
const SESSION_CONFIG = {
    REFRESH_THRESHOLD: 15 * 60 * 1000, // 15 minutes in ms
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours in ms
    REFRESH_CHECK_INTERVAL: 60 * 1000, // Check every minute
};

interface StoredAuth {
    address: string;
    timestamp: number;
    verified: boolean;
    lastRefresh?: number;
}

export const authStorage = {
    save: (data: StoredAuth) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save auth data:', error);
        }
    },

    load: (): StoredAuth | null => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return null;

            const parsed = JSON.parse(data) as StoredAuth;
            
            // Check if auth is expired (24 hours)
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return parsed;
        } catch (error) {
            console.error('Failed to load auth data:', error);
            return null;
        }
    },

    clear: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    },

    update: (updates: Partial<StoredAuth>) => {
        try {
            const current = authStorage.load();
            if (!current) return;

            authStorage.save({
                ...current,
                ...updates,
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error('Failed to update auth data:', error);
        }
    },

    isExpiringSoon: (data: StoredAuth): boolean => {
        const timeSinceRefresh = Date.now() - (data.lastRefresh || data.timestamp);
        return timeSinceRefresh > SESSION_CONFIG.REFRESH_THRESHOLD;
    },

    needsRefresh: (data: StoredAuth | null): boolean => {
        if (!data) return false;
        return authStorage.isExpiringSoon(data);
    },

    refresh: (address: string): StoredAuth => {
        const current = authStorage.load();
        if (!current || current.address !== address) {
            throw new AuthError(
                'Invalid session state',
                AuthErrorCode.INVALID_STATE
            );
        }

        const refreshed: StoredAuth = {
            ...current,
            lastRefresh: Date.now(),
        };

        authStorage.save(refreshed);
        return refreshed;
    }
}; 