import { createHashRouter, Navigate } from "react-router";
import Layout from "../components/layout/layout";
import LoginPage from "../features/Login";
import OrderList from "../features/Order";
import ProtectedRoute from "./ProtectedRoutes";
import OrderDetail from "../features/OrderDetail";
import MaintenancePage from "../components/maintenancepage";
import Home from "../features/Home";
import AdminSettings from "../features/Settings";

export const routes = createHashRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetail />,
      },
      {
        path: "products",
        element: <MaintenancePage />,
      },
      {
        path: "admins",
        element: <MaintenancePage />,
      },
      {
        path: "products/:id",
        element: <MaintenancePage />,
      },
      {
        index: true,
        element: <Home />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
