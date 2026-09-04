import { useAnimeStaff } from "../../hooks/useAnimeStaff";

import "./StaffSection.css";


function StaffSection({ animeId }) {
    const {
        data,
        isLoading,
        isError,
    } = useAnimeStaff(animeId);

    const staff = data?.items ?? [];

    if (!isLoading && !isError && staff.length === 0) {
        return null;
    }

    return (
        <section className="detail-staff anime-section">
            <div className="detail-section-heading">
                <div>
                    <h2>Staff</h2>
                    <span className="detail-section-subtitle">
                        People who worked on this anime
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="staff-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div className="staff-card staff-skeleton" key={index}>
                            <div className="staff-image staff-image-skeleton" />
                            <div className="staff-info">
                                <div className="staff-line staff-line-name" />
                                <div className="staff-line" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <p className="staff-muted">
                    Staff could not be loaded right now.
                </p>
            ) : (
                <div className="staff-grid">
                    {staff.slice(0, 12).map((person) => (
                        <article className="staff-card" key={person.id}>
                            <div className="staff-image-wrap">
                                {person.image ? (
                                    <img
                                        className="staff-image"
                                        src={person.image}
                                        alt={person.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="staff-image staff-image-placeholder" />
                                )}
                            </div>

                            <div className="staff-info">
                                <h3>{person.name}</h3>
                                <div className="staff-positions">
                                    {person.positions.map((position) => (
                                        <span key={position}>{position}</span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}


export default StaffSection;
