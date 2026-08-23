function ErrorState({ text = "Something went wrong" }) {

    return (
        <div
            style={{
                padding: "40px",
                textAlign: "center",
                borderRadius: "16px",
                background: "#1e1e1e",
                color: "#ff6b6b"
            }}
        >
            {text}
        </div>
    );
}

export default ErrorState;