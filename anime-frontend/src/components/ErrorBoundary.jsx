import { Component } from "react";

class ErrorBoundary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
        };
    }


    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }


    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error("Error Boundary caught:", error, errorInfo);
        }
    }


    render() {

        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <h1>Something went wrong</h1>

                    <p>
                        {this.state.error?.message}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            );
        }


        return this.props.children;
    }
}


export default ErrorBoundary;