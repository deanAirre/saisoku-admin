import { createHashRouter } from "react-router";
import Layout from "../components/layout/layout";
import LoginPage from "../features/Login";
import OrderList from "../features/Order";
import ProtectedRoute from "./ProtectedRoutes";
import OrderDetail from "../features/OrderDetail";
import MaintenancePage from "../components/maintenancepage";
import Home from "../features/Home";

export const routes = createHashRouter([
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
        element: <MaintenancePage />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
  },
]);
