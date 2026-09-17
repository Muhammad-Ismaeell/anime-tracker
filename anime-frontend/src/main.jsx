import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./app/router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthProvider from "./context/AuthProvider";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthPromptProvider } from "./context/AuthPromptProvider";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import "./index.css";
import "./anime-detail.css";
import "./review-polish.css";
import "./auth-polish.css";
import "./not-found-polish.css";
import "./layout.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            placeholderData: (previousData) => previousData,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <AuthPromptProvider>
                            <ErrorBoundary>
                                <App />
                            </ErrorBoundary>
                        </AuthPromptProvider>
                    </AuthProvider>
                </BrowserRouter>
                {import.meta.env.DEV && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </QueryClientProvider>
        </HelmetProvider>
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
            }}
        />
    </GoogleOAuthProvider>
);
