import { Link } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";

export default function NotFound() {
    return (
        <PageContainer>
            <main className="not-found-page">
                <div className="not-found-content">
                    <p className="not-found-code">404</p>
                    <h2>Page not found</h2>
                    <p>
                        The page you're looking for doesn't exist or may have been moved.
                    </p>
                    <Link className="not-found-home" to="/">
                        Go Home
                    </Link>
                </div>
            </main>
        </PageContainer>
    );
}
