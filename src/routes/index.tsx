import { createHashRouter, Navigate } from "react-router";
import Layout from "../components/layout/layout";
import LoginPage from "../features/Login";
import OrderList from "../features/Order";
import ProtectedRoute from "./ProtectedRoutes";
import OrderDetail from "../features/OrderDetail";
//import MaintenancePage from "../components/maintenancepage";
import Home from "../features/Home";
import AdminSettings from "../features/Settings";
import AdminProductList from "../features/Product";
import AdminEditProduct from "../features/Product/Edit";
import AdminCreateProduct from "../features/Product/Create";
import AdminManagement from "../features/Admin";
import ProtectedSuperAdminRoute from "./ProtectedRoutes_Super";

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
        element: <AdminProductList />,
      },
      {
        path: "products/:id/edit",
        element: <AdminEditProduct />,
      },
      {
        path: "products/new",
        element: <AdminCreateProduct />,
      },
      {
        path: "admins",
        element: (
          <ProtectedRoute>
            <ProtectedSuperAdminRoute>
              <AdminManagement />
            </ProtectedSuperAdminRoute>
          </ProtectedRoute>
        ),
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
