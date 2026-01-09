import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/index.css";
import { AdminProvider } from "./context/admin-context";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminProvider>
      <RouterProvider router={routes} />
    </AdminProvider>
  </StrictMode>,
);
