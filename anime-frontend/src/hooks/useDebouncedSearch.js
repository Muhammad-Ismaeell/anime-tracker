import { useEffect, useState } from "react";

export function useDebouncedSearch(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timeoutId);
    }, [value, delay]);

    return debounced;
}
