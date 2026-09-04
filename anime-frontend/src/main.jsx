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


            // Keep unused data in memory for 30 minutes
            gcTime: 1000 * 60 * 30,


            // Do not retry bad requests forever
            retry: (failureCount, error) => {

                if (error?.response?.status === 404) {
                    return false;
                }

                if (error?.response?.status === 401) {
                    return false;
                }

                return failureCount < 2;
            },


            // Better UX
            refetchOnWindowFocus: false,


            // Refresh only when needed
            refetchOnReconnect: true,


            // Avoid instant loading flashes
            placeholderData: (previousData) => previousData,

        },


        mutations: {

            retry: false

        }

    }

});

ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <ErrorBoundary>

        <HelmetProvider>

            <BrowserRouter>

                <QueryClientProvider client={queryClient}>

                    <AuthProvider>

                        <ThemeProvider>

                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    duration: 2500,
                                }}
                            />


                            <GoogleOAuthProvider
                                clientId={
                                    import.meta.env.VITE_GOOGLE_CLIENT_ID
                                }
                            >

                                <AuthPromptProvider>

                                    <App />

                                </AuthPromptProvider>

                            </GoogleOAuthProvider>


                            {import.meta.env.DEV && (
                                <ReactQueryDevtools
                                    initialIsOpen={false}
                                />
                            )}


                        </ThemeProvider>

                    </AuthProvider>

                </QueryClientProvider>

            </BrowserRouter>

        </HelmetProvider>

    </ErrorBoundary>

);