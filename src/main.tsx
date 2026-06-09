import { createRoot } from "react-dom/client";
import StoreProvider from "@/StoreProvider";
import ErrorBoundary from "@/ErrorBoundary";
import App from "@/App";
import "@/config/i18n";
import "@/config/dayjs";
import "@/assets/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StoreProvider>,
);
