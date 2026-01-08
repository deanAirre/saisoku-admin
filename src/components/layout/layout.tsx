import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../scrolltotop";
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ScrollToTop />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
