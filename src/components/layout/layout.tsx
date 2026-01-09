import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../scrolltotop";
import Navbar from "../navbar";
const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ScrollToTop />
      <Navbar></Navbar>
      <main className="flex flex-col min-h-screen w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
