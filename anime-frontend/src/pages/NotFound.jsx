import { Link } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";

export default function NotFound() {
    return (
        <PageContainer>
            <div style={{ textAlign: "center", padding: "80px 0" }}>
                <h1 style={{ fontSize: "72px" }}>404</h1>

                <h2>Page not found</h2>

                <p>
                    The page you're looking for doesn't exist.
                </p>

                <Link className="view-all-btn" to="/">
                    Go Home
                </Link>
            </div>
        </PageContainer>
    );
}