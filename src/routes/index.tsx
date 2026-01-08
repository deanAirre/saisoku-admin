import { createBrowserRouter } from "react-router";
import Layout from "../components/layout/layout";
import Home from "../features/Home";
import LoginPage from "../features/Login";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "admin/login",
        element: <LoginPage />,
      },
    ],
  },
]);
