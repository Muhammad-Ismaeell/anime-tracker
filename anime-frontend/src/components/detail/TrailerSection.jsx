function TrailerSection({ trailer }) {
    const embedUrl = trailer?.embed_url;

    if (!embedUrl) {
        return null;
    }

    return (
        <section className="anime-section trailer-section">
            <div className="trailer-section-header">
                <div>
                    <span className="trailer-eyebrow">
                        WATCH
                    </span>

                    <h2>Trailer</h2>
                </div>
            </div>

            <div className="trailer-frame">
                <iframe
                    src={embedUrl}
                    title="Anime trailer"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            </div>
        </section>
    );
}

export default TrailerSection;
