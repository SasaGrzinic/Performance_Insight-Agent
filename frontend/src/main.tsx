import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ApiError } from "./api";
import "./styles.css";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failures, error) =>
        !(error instanceof ApiError && error.status === 401) && failures < 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
