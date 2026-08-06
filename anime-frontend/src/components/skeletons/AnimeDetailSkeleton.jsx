function AnimeDetailSkeleton() {
    return (
        <div style={{
            display: "flex",
            gap: "20px",
            padding: "20px"
        }}>
            
            {/* image skeleton */}
            <div style={{
                width: "300px",
                height: "450px",
                background: "#2a2a2a",
                borderRadius: "10px",
                animation: "pulse 1.5s infinite"
            }} />

            {/* text skeleton */}
            <div style={{ flex: 1 }}>
                
                <div style={{
                    width: "60%",
                    height: "30px",
                    background: "#2a2a2a",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    animation: "pulse 1.5s infinite"
                }} />

                <div style={{
                    width: "30%",
                    height: "20px",
                    background: "#2a2a2a",
                    marginBottom: "20px",
                    borderRadius: "6px",
                    animation: "pulse 1.5s infinite"
                }} />

                {/* button skeleton */}
                <div style={{
                    width: "180px",
                    height: "40px",
                    background: "#2a2a2a",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    animation: "pulse 1.5s infinite"
                }} />

                {/* lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${100 - i * 10}%`,
                            height: "12px",
                            background: "#2a2a2a",
                            marginBottom: "10px",
                            borderRadius: "4px",
                            animation: "pulse 1.5s infinite"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default AnimeDetailSkeleton;