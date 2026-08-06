export default function AnimeSkeleton() {
    return (
        <div
            style={{
                background: "#1a1a1a",
                borderRadius: "12px",
                overflow: "hidden",
                height: "320px",
                position: "relative"
            }}
        >
            <div className="shimmer" style={{
                width: "100%",
                height: "260px"
            }} />

            <div style={{ padding: "10px" }}>
                <div className="shimmer" style={{
                    width: "80%",
                    height: "12px",
                    marginBottom: "8px",
                    borderRadius: "4px"
                }} />

                <div className="shimmer" style={{
                    width: "40%",
                    height: "10px",
                    borderRadius: "4px"
                }} />
            </div>
        </div>
    );
}