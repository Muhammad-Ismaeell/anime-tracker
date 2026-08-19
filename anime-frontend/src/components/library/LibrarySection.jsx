import { memo, useMemo } from "react";

import AnimeCard from "../AnimeCard";
import EmptyState from "../ui/EmptyState";

import { useGlobalLibrary } from "../../hooks/useGlobalLibrary";
import {
    useFavorites,
    useToggleFavorite,
} from "../../hooks/user/useFavorites";


function LibrarySection({ title, items }) {
    const { statusMap } = useGlobalLibrary();

    const { data: favoritesRes } = useFavorites();
    const toggleFavorite = useToggleFavorite();

    const favoriteIds = useMemo(() => {
        return new Set(
            (favoritesRes?.results ?? [])
                .map((favorite) => {
                    const id =
                        favorite.anime?.mal_id ??
                        favorite.anime?.id ??
                        favorite.anime_id ??
                        favorite.mal_id;

                    return id != null ? String(id) : null;
                })
                .filter(Boolean)
        );
    }, [favoritesRes]);


    if (!items.length) {
        return (
            <section className="library-section">
                <h2>{title}</h2>

                <EmptyState
                    text={`No anime in ${title}`}
                />
            </section>
        );
    }


    return (
        <section className="library-section">
            <h2>{title}</h2>

            <div className="grid">
                {items.map((item) => {
                    const source = item.anime ?? item;

                    const animeId =
                        source.mal_id ??
                        source.id ??
                        item.anime_id;

                    if (animeId == null) {
                        return null;
                    }

                    const id = String(animeId);

                    const anime = {
                        id: animeId,
                        title:
                            source.title ??
                            item.title ??
                            "Unknown Anime",
                        image:
                            source.image ??
                            item.image ??
                            "",
                    };

                    return (
                        <AnimeCard
                            key={id}
                            anime={anime}
                            statusMap={statusMap}
                            isFavorited={favoriteIds.has(id)}
                            isFavoritePending={
                                toggleFavorite.isPending
                            }
                            onToggleFavorite={() =>
                                toggleFavorite.mutate({
                                    anime_id: animeId,
                                    title: anime.title,
                                    image: anime.image,
                                })
                            }
                        />
                    );
                })}
            </div>
        </section>
    );
}


export default memo(LibrarySection);