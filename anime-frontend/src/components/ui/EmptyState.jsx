function EmptyState({
    text,
    icon = "📭",
    action,
}) {

    return (
        <div className="empty-state">

            <div className="empty-state-icon">
                {icon}
            </div>

            <p className="empty-state-text">
                {text}
            </p>

            {action && (
                <button
                    className="empty-state-btn"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            )}

        </div>
    );
}

export default EmptyState;