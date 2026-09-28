
import { useLibrary } from "./useLibrary";
import { useMemo } from "react";


export function useGlobalLibrary() {

    const { data } = useLibrary();

    // Flatten paginated library results into a single collection for shared lookups.
    const library = useMemo(() => {

        return (
            data?.pages?.flatMap(
                (page) => page.results || []
            ) || []
        );

    }, [data]);

    // Normalize different anime ID shapes so all library lookups use the same key.
    const libraryMap = useMemo(() => {

        const map = new Map();

        library.forEach((item) => {

            const id =
                item.anime_id ??
                item.anime?.mal_id ??
                item.anime?.id;

            if (id == null) {
                return;
            }

            map.set(
                String(id),
                item
            );
        });

        return map;

    }, [library]);


    const statusMap = useMemo(() => {

        const map = new Map();

        library.forEach((item) => {

            const id =
                item.anime_id ??
                item.anime?.mal_id ??
                item.anime?.id;

            if (id == null) {
                return;
            }

            map.set(
                String(id),
                item.status
            );
        });

        return map;

    }, [library]);


    return {
        library,
        libraryMap,
        statusMap,
    };
}
