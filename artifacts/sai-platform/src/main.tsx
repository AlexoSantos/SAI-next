import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { setBaseUrl } from "@workspace/api-client-react";
import "./index.css";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
setBaseUrl(rawApiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, ""));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
