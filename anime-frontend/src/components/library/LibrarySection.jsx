import AnimeCard from "../AnimeCard";
import EmptyState from "../ui/EmptyState";
import { memo } from "react";
import { useGlobalLibrary } from "../../hooks/useGlobalLibrary";
function LibrarySection({ title, items }) {
    const { statusMap } = useGlobalLibrary();
    
     if (!items.length) {
        return (
            <div className="library-section">
                <h2>{title}</h2>
                <EmptyState text={`No anime in ${title}`} />
            </div>
        );
    }

    return (
        <div className="library-section">

            <h2>{title}</h2>

            <div className="grid">

                {items.map(item => (

                    <AnimeCard
                        key={item.id}
                        anime={{
                            mal_id: item.anime.id,
                            title: item.anime.title,
                            image: item.anime.image,
                            status: item.status,
                            progress: item.progress,
                        }}
                        statusMap={statusMap}
                    />

                ))}

            </div>

        </div>
    );
}

export default memo(LibrarySection);