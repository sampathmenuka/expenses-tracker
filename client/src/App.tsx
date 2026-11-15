/** Ledger Garden style reminder: a warm, editorial personal-finance workspace with calm evergreen structure. */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Visitors on the sign-in page don't download the app, and vice versa.
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const Home = lazy(() => import("./pages/Home"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Don't retry requests the server rejected on purpose.
      retry: (failureCount, error) =>
        !(error instanceof AxiosError && error.response && error.response.status < 500) &&
        failureCount < 2,
    },
  },
});

function FullPageSpinner() {
  return (
    <div className="min-h-screen grid place-items-center" aria-busy="true">
      <Loader2 className="w-6 h-6 animate-spin text-[#154734]" aria-label="Loading" />
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  if (!user) {
    return (
      <Switch>
        <Route path="/register">
          <AuthPage mode="register" />
        </Route>
        <Route path="/login">
          <AuthPage mode="login" />
        </Route>
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return <Home />;
}

function Routes() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Router />
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <Toaster position="top-right" richColors closeButton />
            <Routes />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
