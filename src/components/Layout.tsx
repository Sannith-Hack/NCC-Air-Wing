import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/hooks/use-auth";
import LoadingSpinner from "./LoadingSpinner";
import nccLogo from '@/assets/ncc-logo.png';
import { AuthModal } from "./AuthModal"; // 1. Import the modal

const Layout = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center">
        <div className="flex items-center justify-center space-x-6">
          <img
            src={nccLogo}
            alt="NCC Logo"
            className="h-20 w-20"
          />
          <LoadingSpinner />
        </div>
        <div className="mt-8">
          <p className="text-xl font-semibold text-gray-800">
            Loading Application...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we get things ready for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AuthModal /> {/* 2. Add the modal component here */}
      <Header user={user} isAdmin={isAdmin} />
      <main className="flex-1">
        <Outlet key={location.pathname} />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;