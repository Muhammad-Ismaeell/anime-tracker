import { useState } from "react";

export default function OptimizedImage({
    src,
    alt = "",
    className = "",
    width = 180,
    height = 260,
    ...props
}) {
    const [error, setError] = useState(false);

    const hasImage = Boolean(src) && !error;

    if (!hasImage) {
        return (
            <div
                className={`${className} image-fallback`}
                role="img"
                aria-label={alt || "Image unavailable"}
                style={{
                    width,
                    height,
                }}
            >
                🎬
            </div>
        );
    }

    return (
        <img
            width={width}
            height={height}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setError(true)}
            className={className}
            {...props}
        />
    );
}