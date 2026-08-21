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