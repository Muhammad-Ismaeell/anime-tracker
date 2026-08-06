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


    return (
        <img
            width={width}
            height={height}

            src={
                error
                    ? "/no-image.png"
                    : src || "/no-image.png"
            }

            alt={alt}

            loading="lazy"

            decoding="async"

            onError={() => setError(true)}

            className={className}

            {...props}
        />
    );
}