import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import { ContextPanel } from "@/components/layout/ContextPanel";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TodayView } from "@/pages/views/TodayView";
import { Skeleton } from "@/components/common/Skeleton";

// Today is the landing page; everything else loads when first opened.
const HistoryView = lazy(() =>
  import("@/pages/views/HistoryView").then((m) => ({ default: m.HistoryView }))
);
const ReportsView = lazy(() =>
  import("@/pages/views/ReportsView").then((m) => ({ default: m.ReportsView }))
);
const InsightsView = lazy(() =>
  import("@/pages/views/InsightsView").then((m) => ({ default: m.InsightsView }))
);
const CategoriesView = lazy(() =>
  import("@/pages/views/CategoriesView").then((m) => ({ default: m.CategoriesView }))
);
const SettingsView = lazy(() =>
  import("@/pages/views/SettingsView").then((m) => ({ default: m.SettingsView }))
);

const viewFallback = <Skeleton className="h-96 rounded-3xl" />;

/** The signed-in application: navigation, the active view, and the glance panel. */
export default function Home() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_320px] max-w-[1680px] mx-auto">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="min-w-0 px-4 sm:px-8 lg:px-12 py-6 sm:py-9">
        <MobileNav />
        <Suspense fallback={viewFallback}>
          <Switch>
            <Route path="/" component={TodayView} />
            <Route path="/history" component={HistoryView} />
            <Route path="/reports" component={ReportsView} />
            <Route path="/insights" component={InsightsView} />
            <Route path="/categories" component={CategoriesView} />
            <Route path="/settings" component={SettingsView} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </Suspense>
      </main>

      <ContextPanel />
    </div>
  );
}
