/** Ledger Garden style reminder: a warm, editorial personal-finance workspace with calm evergreen structure. */
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Toaster position="top-right" richColors />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
