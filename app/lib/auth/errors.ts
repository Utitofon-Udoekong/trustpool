export class AuthError extends Error {
    constructor(
        message: string,
        public code: AuthErrorCode,
        public details?: any
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export enum AuthErrorCode {
    NOT_INITIALIZED = 'not_initialized',
    CONNECTION_FAILED = 'connection_failed',
    VERIFICATION_FAILED = 'verification_failed',
    SESSION_EXPIRED = 'session_expired',
    STORAGE_ERROR = 'storage_error',
    INVALID_STATE = 'invalid_state',
    USER_CANCELLED = 'user_cancelled',
}

export const AUTH_ERROR_MESSAGES = {
    [AuthErrorCode.NOT_INITIALIZED]: 'Authentication system not initialized',
    [AuthErrorCode.CONNECTION_FAILED]: 'Failed to connect wallet',
    [AuthErrorCode.VERIFICATION_FAILED]: 'Account verification failed',
    [AuthErrorCode.SESSION_EXPIRED]: 'Authentication session expired',
    [AuthErrorCode.STORAGE_ERROR]: 'Failed to access auth storage',
    [AuthErrorCode.INVALID_STATE]: 'Invalid authentication state',
    [AuthErrorCode.USER_CANCELLED]: 'User cancelled the operation',
}; 