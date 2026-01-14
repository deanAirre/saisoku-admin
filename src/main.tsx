import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/index.css";
import { AdminProvider } from "./context/admin-context";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ToastProvider } from "./context/toast-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AdminProvider>
        <RouterProvider router={routes} />
      </AdminProvider>
    </ToastProvider>
  </StrictMode>,
);
