import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./app/router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthProvider from "./context/AuthProvider";
import ThemeProvider from "./context/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthPromptProvider } from "./context/AuthPromptProvider";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import "./index.css";
import "./detail-polish.css";
import "./review-polish.css";
import "./auth-polish.css";
import "./not-found-polish.css";
import "./final-polish.css";

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
                    <ThemeProvider>
                        <AuthProvider>
                            <AuthPromptProvider>
                                <ErrorBoundary>
                                    <App />
                                </ErrorBoundary>
                            </AuthPromptProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </BrowserRouter>
                <ReactQueryDevtools initialIsOpen={false} />
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
