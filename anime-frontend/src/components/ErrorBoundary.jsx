import { Component } from "react";


class ErrorBoundary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }


    static getDerivedStateFromError() {

        return {
            hasError: true,
        };

    }


    componentDidCatch(error, errorInfo) {

        if (import.meta.env.DEV) {

            console.error(
                "Error Boundary caught:",
                error,
                errorInfo
            );

        }

    }


    handleReload = () => {

        window.location.reload();

    };


    render() {

        if (this.state.hasError) {

            return (

                <div className="error-page">

                    <div className="error-card">

                        <div className="error-icon">
                            💥
                        </div>


                        <h1>
                            Something went wrong
                        </h1>


                        <p>
                            We couldn't load this page.
                            Please try again.
                        </p>


                        <button
                            className="retry-btn"
                            onClick={
                                this.handleReload
                            }
                        >
                            Reload
                        </button>

                    </div>

                </div>

            );

        }


        return this.props.children;

    }

}


export default ErrorBoundary;