// src/lib/normalize.js

export function normalizeListResponse(response) {
    return {
        results: response.data.results ?? response.data ?? [],
        count: response.data.count ?? 0,
        next: response.data.next ?? null,
        previous: response.data.previous ?? null,
    };
}

export function normalizeObjectResponse(response) {
    return response?.data?.data ?? response?.data ?? null;
}