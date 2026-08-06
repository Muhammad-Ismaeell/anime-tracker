function EmptyState({ text }) {

    return (
        <div style={{
            padding: "40px",
            textAlign: "center",
            borderRadius: "16px",
            background: "#1e1e1e",
            color: "#aaa"
        }}>
            {text}
        </div>
    );
}

export default EmptyState;