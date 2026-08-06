export function unwrap(response) {
    return response?.data?.data ?? response?.data ?? response;
}

export function extractItems(response) {
    const data = unwrap(response);

    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.items)) return data.items;

    if (Array.isArray(data?.results)) return data.results;

    return [];
}

export function extractPagination(response) {
    const data = unwrap(response);

    return {
        page: data?.page ?? 1,
        has_next: data?.has_next ?? false
    };
}