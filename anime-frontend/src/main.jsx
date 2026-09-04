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
import "./index.css";
import "./detail-polish.css";
import "./review-polish.css";
import "./auth-polish.css";
import "./not-found-polish.css";
import "./final-polish.css";
import { AuthPromptProvider } from "./context/AuthPromptProvider";
import {
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query";


const queryClient = new QueryClient({

    defaultOptions: {

        queries: {

            // Data stays fresh for 5 minutes
            staleTime: 1000 * 60 * 5,

            // Keep unused data for 10 minutes
            gcTime: 1000 * 60 * 10,

            // Don't retry on every failure
            retry: 1,

            // Show previous data while fetching
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
