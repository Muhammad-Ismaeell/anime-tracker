import { Link } from "react-router-dom";

const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Romance",
    "Horror",
    "Mystery",
    "Sci-Fi",
    "Sports",
    "Supernatural",
];

export default function DiscoverGenres() {
    return (
        <section className="discover-genres">

            <div className="discover-genres-header">

                <div>
                    <span className="discover-genres-eyebrow">
                        DISCOVER
                    </span>

                    <h2 className="discover-genres-title">
                        Explore by Genre
                    </h2>
                </div>

            </div>


            <div className="discover-genres-row">

                {genres.map((genre) => (
                    <Link
                        key={genre}
                        to={`/search?genres=${encodeURIComponent(genre)}`}
                        className="discover-genre"
                    >
                        {genre}
                    </Link>
                ))}


                <Link
                    to="/search"
                    className="discover-genres-arrow"
                    aria-label="Explore all anime"
                >
                    →
                </Link>

            </div>

        </section>
    );
}