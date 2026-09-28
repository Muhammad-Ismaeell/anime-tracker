// Keep auth event listeners outside React so the API layer can notify the app without a component dependency.
let accessTokenListener = null;
let sessionExpiredListener = null;

export function setAccessTokenListener(listener) {
    accessTokenListener = listener;
}

export function notifyAccessTokenChanged(token) {
    accessTokenListener?.(token);
}

export function setSessionExpiredListener(listener) {
    sessionExpiredListener = listener;
}

export function notifySessionExpired() {
    sessionExpiredListener?.();
}