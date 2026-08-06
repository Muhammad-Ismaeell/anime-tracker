import { useLibrary } from "./useLibrary";
import { useMemo } from "react";

export function useGlobalLibrary() {

    const { data } = useLibrary();

    const library = useMemo(() => {

        return (
            data?.pages?.flatMap(
                page => page.results || []
            ) || []
        );

    }, [data]);

    const statusMap = useMemo(() => {

        const map = new Map();

        library.forEach(item => {

            const id =
                item.anime_id ??
                item.anime?.mal_id ??
                item.anime?.id;

            if (!id) return;

            map.set(
                String(id),
                item.status
            );
        });

        return map;

    }, [library]);

    return {
        library,
        statusMap
    };
}