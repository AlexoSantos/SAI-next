import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuthStore } from "./store/auth";
import { useThemeStore, applyThemeToDOM } from "./store/theme";
import { useRealtime } from "./hooks/use-realtime";
import { AuthInit } from "./components/auth-init";
import { AppLayout } from "./components/layout/app-layout";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import MapPage from "./pages/map";
import Analytics from "./pages/analytics";
import Alerts from "./pages/alerts";
import Stations from "./pages/stations";
import Admin from "./pages/admin";
import ControlCenter from "./pages/control-center";
import NotFound from "./pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function App() {
  useRealtime();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeToDOM("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <AuthInit>
      <TooltipProvider>
        <Switch>
          <Route path="/login">
            {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
          </Route>
          <Route path="/">
            {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
          </Route>

          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/map" component={() => <ProtectedRoute component={MapPage} />} />
          <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
          <Route path="/alerts" component={() => <ProtectedRoute component={Alerts} />} />
          <Route path="/stations" component={() => <ProtectedRoute component={Stations} />} />
          <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
          <Route path="/control-center" component={() => <ProtectedRoute component={ControlCenter} />} />

          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </AuthInit>
  );
}

export default App;
